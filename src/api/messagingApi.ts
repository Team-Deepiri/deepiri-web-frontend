import axios, { AxiosInstance } from 'axios';
import type {
  ApiResponse,
  AxisErrorResponse,
  AppLocation,
  AppLocationLatLng,
} from './types';

const getBaseUrl = (): string => {
  const envUrl = (import.meta.env?.VITE_CYREX_BASE_URL as string) || 'http://localhost:8000';
  if (typeof window !== 'undefined' && envUrl.includes('cyrex:')) {
    return envUrl.replace('cyrex:', 'localhost:');
  }
  return envUrl;
};

class MessageAPI {
  public client: AxiosInstance;

  constructor(baseUrl?: string, apiKey?: string) {
    this.client = axios.create({
      baseURL: baseUrl || getBaseUrl(),
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'x-api-key': apiKey } : {}),
      },
    });
  }

  setApiKey(apiKey: string): void {
    this.client.defaults.headers['x-api-key'] = apiKey;
  }

  setBaseUrl(baseUrl: string): void {
    this.client.defaults.baseURL = baseUrl;
  }

  /**
   * Analyze an invoice for potential fraud
   */
  async analyzeInvoice(
    invoice: InvoiceData,
    industry: Industry = 'property_management',
    sessionId?: string
  ): Promise<{ success: boolean; analysis: InvoiceAnalysisResult }> {
    const response = await this.client.post('/vendor-fraud/analyze-invoice', {
      invoice,
      industry,
      include_vendor_history: true,
      session_id: sessionId,
    });
    return response.data;
  }

  /**
   * Get vendor profile and intelligence
   */
  async getVendorProfile(
    vendorId: string,
    industry: Industry = 'property_management'
  ): Promise<{ success: boolean; vendor_profile: VendorProfile }> {
    const response = await this.client.post('/vendor-fraud/vendor-profile', {
      vendor_id: vendorId,
      industry,
    });
    return response.data;
  }

  /**
   * Check pricing against market benchmarks
   */
  async checkPricingBenchmark(
    serviceType: string,
    industry: Industry = 'property_management',
    priceToCheck?: number
  ): Promise<{ success: boolean; benchmark: PricingBenchmark }> {
    const response = await this.client.post('/vendor-fraud/pricing-benchmark', {
      service_type: serviceType,
      industry,
      price_to_check: priceToCheck,
    });
    return response.data;
  }

  /**
   * Ingest a document into the knowledge base
   */
  async ingestDocument(
    content: string,
    title: string,
    industry: Industry = 'property_management',
    docType: string = 'vendor_invoice',
    metadata: Record<string, unknown> = {}
  ): Promise<{ success: boolean; document_id: string; message: string }> {
    const response = await this.client.post('/vendor-fraud/ingest-document', {
      content,
      title,
      doc_type: docType,
      industry,
      metadata,
    });
    return response.data;
  }

  /**
   * Query the knowledge base
   */
  async queryKnowledgeBase(
    query: string,
    industry: Industry = 'property_management',
    topK: number = 5
  ): Promise<{ success: boolean; query: string; results: string }> {
    const response = await this.client.post('/vendor-fraud/query', {
      query,
      industry,
      top_k: topK,
    });
    return response.data;
  }

  /**
   * Chat with the fraud detection agent
   */
  async chat(
    message: string,
    industry: Industry = 'property_management',
    sessionId?: string,
    context: Record<string, unknown> = {}
  ): Promise<{
    success: boolean;
    response: string;
    confidence: number;
    tool_calls: unknown[];
  }> {
    const response = await this.client.post('/vendor-fraud/chat', {
      message,
      industry,
      session_id: sessionId,
      context,
    });
    return response.data;
  }

  /**
   * List supported industries
   */
  async listIndustries(): Promise<{ success: boolean; industries: IndustryInfo[] }> {
    const response = await this.client.get('/vendor-fraud/industries');
    return response.data;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; service: string; version: string }> {
    const response = await this.client.get('/vendor-fraud/health');
    return response.data;
  }

  /**
   * Get analytics
   */
  async getAnalytics(
    industry?: Industry,
    startDate?: string,
    endDate?: string
  ): Promise<{ success: boolean; analytics: unknown }> {
    const response = await this.client.get('/vendor-fraud/analytics', {
      params: {
        industry: industry,
        start_date: startDate,
        end_date: endDate,
      },
    });
    return response.data;
  }

  /**
   * Search vendors
   */
  async searchVendors(
    query?: string,
    industry?: Industry,
    riskLevel?: string,
    status?: string,
    limit: number = 50
  ): Promise<{ success: boolean; vendors: unknown[]; count: number }> {
    const response = await this.client.get('/vendor-fraud/vendors', {
      params: {
        query,
        industry,
        risk_level: riskLevel,
        status,
        limit,
      },
    });
    return response.data;
  }

  /**
   * Get vendor details
   */
  async getVendorDetails(vendorId: string): Promise<{ success: boolean; vendor: unknown; cross_industry_intelligence: unknown }> {
    const response = await this.client.get(`/vendor-fraud/vendors/${vendorId}`);
    return response.data;
  }

  /**
   * Verify document
   */
  async verifyDocument(
    documentContent: string,
    documentType: string = 'invoice',
    industry: Industry = 'property_management',
    verifyAuthenticity: boolean = true
  ): Promise<{ success: boolean; extracted_data: unknown; verification: unknown }> {
    const formData = new FormData();
    formData.append('document_content', documentContent);
    formData.append('document_type', documentType);
    formData.append('industry', industry);
    formData.append('verify_authenticity', String(verifyAuthenticity));

    const response = await this.client.post('/vendor-fraud/verify-document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const vendorFraudApi = new VendorFraudAPI();
export default VendorFraudAPI;