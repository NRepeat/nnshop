/**
 * Liqpay Payment Module
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is available through the world-wide-web at this URL:
 * http://opensource.org/licenses/osl-3.0.php
 *
 * @module          liqpay
 * @category        LiqPay
 * @package         liqpay/liqpay
 * @version         3.1
 * @author          Liqpay
 * @copyright       Copyright (c) 2014 Liqpay
 * @license         http://opensource.org/licenses/osl-3.0.php Open Software License (OSL 3.0)
 *
 * EXTENSION INFORMATION
 *
 * LIQPAY API       https://www.liqpay.ua/documentation/uk
 */

import crypto from 'crypto';
import axios from 'axios';
import SdkButton from '../ui/SdkButton';

export interface LiqPayParams {
  version: number | string;
  public_key?: string;
  action: string;
  amount: number | string;
  currency: string;
  description: string;
  order_id?: string;
  language?: 'ru' | 'uk' | 'en';
  server_url?: string;
  result_url?: string;
  [key: string]: any;
}

export interface LiqPayFormObject {
  data: string;
  signature: string;
}

export type Language = 'ru' | 'uk' | 'en';

export class LiqPay {
  private readonly host: string = 'https://www.liqpay.ua/api/';
  private readonly availableLanguages: Language[] = ['ru', 'uk', 'en'];
  private readonly buttonTranslations: Record<Language, string> = {
    ru: 'Оплатить',
    uk: 'Сплатити',
    en: 'Pay',
  };

  constructor(
    private readonly publicKey: string,
    private readonly privateKey: string,
  ) {}

  /**
   * Call API
   *
   * @param {string} path
   * @param {LiqPayParams} params
   * @return {Promise<any>}
   * @throws {Error}
   */
  async api(path: string, params: LiqPayParams): Promise<any> {
    if (!params.version) {
      throw new Error('version is null');
    }

    params.public_key = this.publicKey;
    const data = Buffer.from(JSON.stringify(params)).toString('base64');
    const signature = this.strToSign(this.privateKey + data + this.privateKey);

    const dataToSend = new URLSearchParams();
    dataToSend.append('data', data);
    dataToSend.append('signature', signature);

    try {
      const response = await axios.post(this.host + path, dataToSend, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error(`Request failed with status code: ${response.status}`);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate CNB form HTML
   *
   * @param {LiqPayParams} params
   * @return {string}
   * @throws {Error}
   */
  cnbForm(params: LiqPayParams) {
    let buttonText = this.buttonTranslations['uk'];
    if (params.language && this.availableLanguages.includes(params.language)) {
      buttonText = this.buttonTranslations[params.language];
    }

    const processedParams = this.cnbParams(params);
    const data = Buffer.from(JSON.stringify(processedParams)).toString(
      'base64',
    );
    const signature = this.strToSign(this.privateKey + data + this.privateKey);

    return (
      <form
        method="POST"
        action="https://www.liqpay.ua/api/3/checkout"
        acceptCharset="utf-8"
      >
        <input type="hidden" name="data" value={data} />
        <input type="hidden" name="signature" value={signature} />
        <SdkButton label={buttonText} />
      </form>
    );
  }

  /**
   * Generate CNB signature
   *
   * @param {LiqPayParams} params
   * @return {string}
   * @throws {Error}
   */
  cnbSignature(params: LiqPayParams): string {
    const processedParams = this.cnbParams(params);
    const data = Buffer.from(JSON.stringify(processedParams)).toString(
      'base64',
    );
    return this.strToSign(this.privateKey + data + this.privateKey);
  }

  /**
   * Process and validate CNB parameters
   *
   * @param {LiqPayParams} params
   * @return {LiqPayParams}
   * @throws {Error}
   */
  cnbParams(params: LiqPayParams): LiqPayParams {
    const processedParams = { ...params };
    processedParams.public_key = this.publicKey;

    // Validate and convert version to number
    if (processedParams.version) {
      if (
        typeof processedParams.version === 'string' &&
        !isNaN(Number(processedParams.version))
      ) {
        processedParams.version = Number(processedParams.version);
      } else if (typeof processedParams.version !== 'number') {
        throw new Error(
          'version must be a number or a string that can be converted to a number',
        );
      }
    } else {
      throw new Error('version is null');
    }

    // Validate and convert amount to number
    if (processedParams.amount) {
      if (
        typeof processedParams.amount === 'string' &&
        !isNaN(Number(processedParams.amount))
      ) {
        processedParams.amount = Number(processedParams.amount);
      } else if (typeof processedParams.amount !== 'number') {
        throw new Error(
          'amount must be a number or a string that can be converted to a number',
        );
      }
    } else {
      throw new Error('amount is null');
    }

    // Ensure required parameters are strings
    const stringParams = ['action', 'currency', 'description'] as const;
    for (const param of stringParams) {
      if (
        processedParams[param] &&
        typeof processedParams[param] !== 'string'
      ) {
        processedParams[param] = String(processedParams[param]);
      } else if (!processedParams[param]) {
        throw new Error(`${param} is null or not provided`);
      }
    }

    // Check if language is set and is valid
    if (
      processedParams.language &&
      !this.availableLanguages.includes(processedParams.language)
    ) {
      processedParams.language = 'uk';
    }

    return processedParams;
  }

  /**
   * Generate SHA1 signature
   *
   * @param {string} str
   * @return {string}
   * @throws {Error}
   */
  private strToSign(str: string): string {
    if (typeof str !== 'string') {
      throw new Error('Input must be a string');
    }

    const sha1 = crypto.createHash('sha1');
    sha1.update(str);
    return sha1.digest('base64');
  }

  /**
   * Return Form Object
   *
   * @param {LiqPayParams} params
   * @return {LiqPayFormObject} Form Object
   */
  cnbObject(params: LiqPayParams): LiqPayFormObject {
    const processedParams = { ...params };
    processedParams.language = processedParams.language || 'uk';

    const finalParams = this.cnbParams(processedParams);
    const data = Buffer.from(JSON.stringify(finalParams)).toString('base64');
    const signature = this.strToSign(this.privateKey + data + this.privateKey);

    return { data, signature };
  }

  /**
   * Verify callback signature
   *
   * @param {string} data
   * @param {string} signature
   * @return {boolean}
   */
  verifyCallback(data: string, signature: string): boolean {
    const expectedSignature = this.strToSign(
      this.privateKey + data + this.privateKey,
    );
    return signature === expectedSignature;
  }

  /**
   * Decode callback data
   *
   * @param {string} data
   * @return {any}
   */
  decodeData(data: string): any {
    return JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
  }
}

// Factory function for backwards compatibility
export function createLiqPay(publicKey: string, privateKey: string): LiqPay {
  return new LiqPay(publicKey, privateKey);
}

export default LiqPay;
