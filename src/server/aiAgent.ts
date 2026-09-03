// ReviveAI — AI Investigation Agent with Server-side Gemini & Fallback Diagnosis
import { GoogleGenAI, Type } from '@google/genai';
import { ActionType, AIDiagnosis, Customer, RecoveryCase, RiskLevel } from '../types';

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    genAIClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return genAIClient;
}

export class AIAgentService {
  public async investigateCase(caseData: RecoveryCase): Promise<AIDiagnosis> {
    const ai = getGenAI();

    // If Gemini API Key is available, use Gemini 3.8 Flash with structured JSON
    if (ai) {
      try {
        const prompt = `You are ReviveAI Investigation Agent, a senior fintech revenue recovery analyst.
Analyze the following payment recovery case for a Razorpay merchant:

Case ID: ${caseData.id}
Event Type: ${caseData.event_type}
Amount: ₹${caseData.amount} INR
Payment Method: ${caseData.payment_method}
Failure Reason: ${caseData.failure_reason}
Days Overdue: ${caseData.days_overdue}
Previous Retries: ${caseData.retry_count}
Customer Name: ${caseData.customer.name}
Customer Segment: ${caseData.customer.segment}
Tenure (Days): ${caseData.customer.tenure_days}
Previous Successful Payments: ${caseData.customer.previous_successes}
Previous Failed Payments: ${caseData.customer.previous_failures}
Historical Recovery Rate: ${(caseData.customer.historical_recovery_rate * 100).toFixed(1)}%
Opted Out: ${caseData.customer.customer_opted_out}
ML Recovery Probability: ${(caseData.recovery_probability * 100).toFixed(1)}%

Provide a strict clinical financial diagnosis, your confidence score (0.00 - 1.00), a bounded recommended action from ['RETRY_PAYMENT', 'SEND_PAYMENT_LINK', 'SEND_REMINDER', 'SEND_INVOICE_REMINDER', 'SCHEDULE_RETRY', 'ESCALATE_HUMAN', 'STOP_RECOVERY'], 3 distinct factual reasoning statements, customer risk classification ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'), and whether human review should be mandated.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: 'You are an objective enterprise revenue recovery diagnostic agent. Never issue commands to arbitrary payment endpoints. Output structured JSON only.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                diagnosis: { type: Type.STRING, description: 'Clinical payment failure diagnosis summary' },
                confidence: { type: Type.NUMBER, description: 'Confidence between 0.00 and 1.00' },
                recommended_action: {
                  type: Type.STRING,
                  description: 'Action from RETRY_PAYMENT, SEND_PAYMENT_LINK, SEND_REMINDER, SEND_INVOICE_REMINDER, SCHEDULE_RETRY, ESCALATE_HUMAN, STOP_RECOVERY'
                },
                reasoning: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'List of 3 concrete evidence points'
                },
                customer_risk: {
                  type: Type.STRING,
                  description: 'LOW, MEDIUM, HIGH, or CRITICAL'
                },
                requires_human_review: {
                  type: Type.BOOLEAN,
                  description: 'True if high risk or ambiguous'
                }
              },
              required: ['diagnosis', 'confidence', 'recommended_action', 'reasoning', 'customer_risk', 'requires_human_review']
            }
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          const validActions: ActionType[] = [
            'RETRY_PAYMENT',
            'SEND_PAYMENT_LINK',
            'SEND_REMINDER',
            'SEND_INVOICE_REMINDER',
            'SCHEDULE_RETRY',
            'ESCALATE_HUMAN',
            'STOP_RECOVERY'
          ];
          const recAction: ActionType = validActions.includes(parsed.recommended_action)
            ? parsed.recommended_action
            : 'SEND_PAYMENT_LINK';

          return {
            case_id: caseData.id,
            diagnosis: parsed.diagnosis,
            confidence: Number(parsed.confidence) || 0.85,
            recommended_action: recAction,
            reasoning: Array.isArray(parsed.reasoning) ? parsed.reasoning : [parsed.diagnosis],
            customer_risk: (['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(parsed.customer_risk) ? parsed.customer_risk : 'MEDIUM') as RiskLevel,
            requires_human_review: Boolean(parsed.requires_human_review),
            is_fallback: false,
            created_at: new Date().toISOString()
          };
        }
      } catch (err) {
        console.warn('Gemini AI Investigation failed, invoking deterministic fallback:', err);
      }
    }

    // High-Fidelity Deterministic Fallback Diagnostic Engine
    return this.fallbackInvestigation(caseData);
  }

  public fallbackInvestigation(caseData: RecoveryCase): AIDiagnosis {
    const { failure_reason, payment_method, retry_count, days_overdue, amount, customer, recovery_probability } = caseData;

    let diagnosis = '';
    let recommended_action: ActionType = 'SEND_PAYMENT_LINK';
    const reasoning: string[] = [];
    let confidence = 0.88;
    let customer_risk: RiskLevel = 'LOW';
    let requires_human_review = false;

    // Diagnose based on domain facts
    if (customer.customer_opted_out) {
      diagnosis = 'Customer has requested opt-out from automated collection messages. Recovery halted per compliance.';
      recommended_action = 'STOP_RECOVERY';
      reasoning.push('Explicit customer opt-out flag registered in profile.');
      reasoning.push('Halting outreach protects merchant brand equity and regulatory compliance.');
      customer_risk = 'HIGH';
    } else if (failure_reason === 'FRAUD_CHECK_FAILED' || caseData.event_type === 'DISPUTE_DETECTED') {
      diagnosis = 'Transaction triggered automated fraud guardrails or payment dispute. Potential chargeback exposure.';
      recommended_action = 'ESCALATE_HUMAN';
      reasoning.push('Critical failure code FRAUD_CHECK_FAILED detected.');
      reasoning.push('Requires manual review by Risk & Fraud Operations.');
      customer_risk = 'CRITICAL';
      requires_human_review = true;
    } else if (['BANK_DOWNTIME', 'NETWORK_TIMEOUT'].includes(failure_reason)) {
      if (retry_count < 2) {
        diagnosis = `Transient network/clearing failure at issuing bank for ${payment_method}. Highly recoverable via smart retry.`;
        recommended_action = 'RETRY_PAYMENT';
        reasoning.push(`Bank code failure is temporary and unrelated to customer credit or funds.`);
        reasoning.push(`Customer has ${customer.previous_successes} successful historic payments.`);
        reasoning.push(`Retry saturation is low (${retry_count} prior retries).`);
        confidence = 0.92;
        customer_risk = 'LOW';
      } else {
        diagnosis = `Repeated bank clearing timeouts on primary instrument. Diverting to alternate payment link.`;
        recommended_action = 'SEND_PAYMENT_LINK';
        reasoning.push(`2 prior automated retries failed with issuing bank.`);
        reasoning.push(`Payment link allows customer to switch between UPI, Cards, and Netbanking.`);
        confidence = 0.84;
        customer_risk = 'MEDIUM';
      }
    } else if (failure_reason === 'INSUFFICIENT_FUNDS') {
      diagnosis = 'Debit declined due to insufficient balance. Best recoverable around standard salary or settlement cycles.';
      recommended_action = 'SCHEDULE_RETRY';
      reasoning.push('Immediate retries on insufficient balance risk customer bank penalties and friction.');
      reasoning.push('Smart scheduling offsets retry to expected liquidity cycle.');
      reasoning.push(`Customer historical recovery rate is ${(customer.historical_recovery_rate * 100).toFixed(0)}%.`);
      confidence = 0.81;
      customer_risk = 'MEDIUM';
    } else if (caseData.event_type === 'INVOICE_OVERDUE') {
      diagnosis = `Invoice overdue by ${days_overdue} days for ${customer.segment} account. Contextual invoice reminder recommended.`;
      recommended_action = 'SEND_INVOICE_REMINDER';
      reasoning.push(`Account segment is ${customer.segment} with established tenure of ${customer.tenure_days} days.`);
      reasoning.push(`Invoice overdue duration is ${days_overdue} days, within standard B2B grace period.`);
      confidence = 0.89;
      customer_risk = 'LOW';
    } else {
      // Default checkout / payment link
      diagnosis = `Uncompleted payment for ₹${amount.toLocaleString('en-IN')}. Sending streamlined 1-click Razorpay payment link.`;
      recommended_action = 'SEND_PAYMENT_LINK';
      reasoning.push(`Recovery probability is ${(recovery_probability * 100).toFixed(0)}%.`);
      reasoning.push(`Payment link reduces drop-off friction across multiple payment methods.`);
      confidence = 0.86;
      customer_risk = amount > 20000 ? 'HIGH' : 'LOW';
    }

    if (amount > 10000) {
      requires_human_review = true;
      reasoning.push(`High value transaction (₹${amount.toLocaleString('en-IN')}) triggers required human review.`);
      if (customer_risk === 'LOW') customer_risk = 'MEDIUM';
    }

    return {
      case_id: caseData.id,
      diagnosis,
      confidence,
      recommended_action,
      reasoning,
      customer_risk,
      requires_human_review,
      is_fallback: true,
      created_at: new Date().toISOString()
    };
  }
}

export const aiAgentService = new AIAgentService();
