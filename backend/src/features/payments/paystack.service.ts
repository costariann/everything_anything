import crypto from 'crypto';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { BadRequestError, NotFoundError } from '../../shared/errors/AppError';
import { logger } from '../../shared/utils/logger';

interface InitializePaymentParams {
  orderPublicId: string;
  email: string;
  callbackUrl?: string;
}

interface PaystackInitResponse {
  authorization_url: string;
  access_code: string;
  reference: string;
}

export class PaystackService {
  private getSecretKey(): string {
    return (
      process.env.PAYSTACK_SECRET_KEY ||
      env.PAYSTACK_SECRET_KEY ||
      ''
    ).trim();
  }

  private isReady(): boolean {
    const key = this.getSecretKey();
    return Boolean(key && key.startsWith('sk_'));
  }

  constructor() {
    if (this.isReady()) {
      logger.info('💳 Paystack payment gateway initialized successfully for Ghana (GHS)');
    } else {
      logger.warn(
        '⚠️ Paystack secret key not configured or invalid (must start with sk_test_ or sk_live_). Running in test simulation mode.'
      );
    }
  }

  /**
   * Initializes a Paystack checkout transaction in Ghana Cedis (GHS)
   * Supports Mobile Money (MTN MoMo, Telecel / Vodafone Cash, AT Money) and Bank Cards.
   */
  async initializePayment(params: InitializePaymentParams): Promise<PaystackInitResponse> {
    const { orderPublicId, email, callbackUrl } = params;

    const order = await prisma.order.findUnique({
      where: { publicId: orderPublicId },
      include: { user: true },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.status === 'CANCELLED') {
      throw new BadRequestError('Cannot process payment for a cancelled order.');
    }

    if (order.paymentStatus === 'PAID') {
      throw new BadRequestError('This order has already been paid.');
    }

    // Reference format: PSTK_ORD-xxxxxx_timestamp
    const reference = `PSTK_${order.orderNumber}_${Date.now()}`;
    const amountInPesewas = Math.round(Number(order.totalAmount) * 100);

    // If live/test secret key is configured, call Paystack REST API
    if (this.isReady()) {
      try {
        const secret = this.getSecretKey();
        const payload = {
          email: email || order.guestEmail || order.user?.email || 'customer@everythinganything.com',
          amount: amountInPesewas,
          currency: 'GHS',
          reference,
          channels: ['card', 'mobile_money', 'bank'],
          callback_url: callbackUrl || `http://localhost:3000/orders/${order.publicId}?reference=${reference}`,
          metadata: {
            orderPublicId: order.publicId,
            orderNumber: order.orderNumber,
            customerPhone: order.guestPhone || order.user?.phone || '',
            custom_fields: [
              {
                display_name: 'Order Number',
                variable_name: 'order_number',
                value: order.orderNumber,
              },
            ],
          },
        };

        const response = await fetch('https://api.paystack.co/transaction/initialize', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${secret}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data: any = await response.json();

        if (!response.ok || !data.status) {
          logger.error('Paystack initialization failed:', data);
          throw new BadRequestError(data.message || 'Failed to initialize Paystack transaction');
        }

        logger.info(
          `💳 Paystack transaction initialized for order ${order.orderNumber} (Ref: ${reference})`
        );

        return {
          authorization_url: data.data.authorization_url,
          access_code: data.data.access_code,
          reference: data.data.reference,
        };
      } catch (err: any) {
        logger.error('Paystack API call failed:', err);
        throw new BadRequestError(`Paystack payment failed: ${err.message}`);
      }
    }

    // Fallback sandbox simulation when API key not yet provided
    logger.info(`💳 Simulating Paystack checkout for order ${order.orderNumber} in test mode`);
    const simUrl = `http://localhost:3000/orders/${order.publicId}?reference=${reference}&simulated=true`;

    return {
      authorization_url: simUrl,
      access_code: `mock_code_${Date.now()}`,
      reference,
    };
  }

  /**
   * Verifies a Paystack transaction status and marks Order as PAID idempotently
   */
  async verifyPayment(reference: string) {
    if (!reference) {
      throw new BadRequestError('Payment reference is required');
    }

    // 1. If real Paystack key configured, verify against Paystack REST API
    if (this.isReady()) {
      try {
        const secret = this.getSecretKey();
        const response = await fetch(
          `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${secret}`,
            },
          }
        );

        const data: any = await response.json();

        if (!response.ok || !data.status) {
          logger.error('Paystack verification failed:', data);
          throw new BadRequestError(data.message || 'Payment verification failed');
        }

        const transaction = data.data;

        if (transaction.status === 'success') {
          // Resolve order by reference or orderNumber
          const orderNumber =
            transaction.metadata?.orderNumber ||
            reference.replace(/^PSTK_/, '').replace(/_\d+$/, '');
          const orderPublicId = transaction.metadata?.orderPublicId;

          const order = await prisma.order.findFirst({
            where: {
              OR: [
                ...(orderPublicId ? [{ publicId: orderPublicId }] : []),
                ...(orderNumber ? [{ orderNumber }] : []),
              ],
            },
            include: { items: true },
          });

          if (!order) {
            throw new NotFoundError(`No order found matching reference: ${reference}`);
          }

          // Idempotency guard: if already marked PAID (e.g. webhook beat browser redirect), return immediately
          if (order.paymentStatus === 'PAID') {
            return {
              verified: true,
              alreadyProcessed: true,
              order,
              transaction,
            };
          }

          // Verify paid amount (in pesewas) matches order total to prevent amount-tampering
          const expectedPesewas = Math.round(Number(order.totalAmount) * 100);
          if (typeof transaction.amount === 'number' && transaction.amount < expectedPesewas) {
            logger.error(
              `Paystack amount mismatch for order ${order.orderNumber}: expected ${expectedPesewas}, got ${transaction.amount}`
            );
            throw new BadRequestError('Paid amount does not match order total.');
          }

          // Atomic conditional update to prevent concurrent webhook + redirect race condition
          await prisma.order.updateMany({
            where: {
              id: order.id,
              paymentStatus: { not: 'PAID' },
            },
            data: {
              paymentStatus: 'PAID',
              status: order.status === 'PENDING' ? 'PROCESSING' : order.status,
              notes: order.notes
                ? `${order.notes} | Paystack Ref: ${reference} (${transaction.channel || 'MoMo/Card'})`
                : `Paystack Ref: ${reference} (${transaction.channel || 'MoMo/Card'})`,
            },
          });

          const updated = await prisma.order.findUniqueOrThrow({
            where: { id: order.id },
            include: { items: true },
          });

          logger.info(`✅ Paystack payment confirmed for order ${order.orderNumber}`);
          return {
            verified: true,
            order: updated,
            transaction,
          };
        } else {
          return {
            verified: false,
            status: transaction.status,
            message: transaction.gateway_response || 'Payment not completed',
          };
        }
      } catch (err: any) {
        logger.error('Error verifying Paystack transaction:', err);
        throw new BadRequestError(`Verification failed: ${err.message}`);
      }
    }

    // 2. Simulation mode verification (auto-confirms mock reference idempotently)
    const orderNumber = reference.replace(/^PSTK_/, '').replace(/_\d+$/, '');
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ orderNumber }],
      },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundError(`Order for reference ${reference} not found`);
    }

    if (order.paymentStatus === 'PAID') {
      return {
        verified: true,
        alreadyProcessed: true,
        order,
        simulated: true,
      };
    }

    await prisma.order.updateMany({
      where: {
        id: order.id,
        paymentStatus: { not: 'PAID' },
      },
      data: {
        paymentStatus: 'PAID',
        status: order.status === 'PENDING' ? 'PROCESSING' : order.status,
        notes: order.notes
          ? `${order.notes} | Paystack (Simulated): ${reference}`
          : `Paystack (Simulated): ${reference}`,
      },
    });

    const updated = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: { items: true },
    });

    return {
      verified: true,
      order: updated,
      simulated: true,
    };
  }

  /**
   * Validates Paystack Webhook signature and processes charge.success events
   */
  async handleWebhook(signature: string, rawBody: string, event: any) {
    if (this.isReady()) {
      const hash = crypto
        .createHmac('sha512', this.getSecretKey())
        .update(rawBody)
        .digest('hex');

      if (hash !== signature) {
        logger.warn('⚠️ Invalid Paystack webhook signature rejected');
        throw new BadRequestError('Invalid webhook signature');
      }
    }

    if (event.event === 'charge.success') {
      const { reference } = event.data;
      logger.info(`🔔 Webhook received charge.success for ref: ${reference}`);
      return this.verifyPayment(reference);
    }

    return { received: true };
  }
}

export const paystackService = new PaystackService();
