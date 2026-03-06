export function generatePixPayload(key: string, name: string, city: string, amount?: number, message?: string): string {
    const ID_PAYLOAD_FORMAT_INDICATOR = '00';
    const ID_MERCHANT_ACCOUNT_INFORMATION = '26';
    const ID_MERCHANT_CATEGORY_CODE = '52';
    const ID_TRANSACTION_CURRENCY = '53';
    const ID_TRANSACTION_AMOUNT = '54';
    const ID_COUNTRY_CODE = '58';
    const ID_MERCHANT_NAME = '59';
    const ID_MERCHANT_CITY = '60';
    const ID_ADDITIONAL_DATA_FIELD_TEMPLATE = '62';
    const ID_CRC16 = '63';

    function format(id: string, value: string) {
        const len = value.length.toString().padStart(2, '0');
        return `${id}${len}${value}`;
    }

    const gui = format('00', 'br.gov.bcb.pix');
    const pixKey = format('01', key);
    const pixMessage = message ? format('02', message) : '';

    const merchantAccountInfo = format(ID_MERCHANT_ACCOUNT_INFORMATION, gui + pixKey + pixMessage);

    const mcc = format(ID_MERCHANT_CATEGORY_CODE, '0000');
    const currency = format(ID_TRANSACTION_CURRENCY, '986');
    const txAmount = amount && amount > 0 ? format(ID_TRANSACTION_AMOUNT, amount.toFixed(2)) : '';
    const country = format(ID_COUNTRY_CODE, 'BR');

    // Clean special characters and limit length
    const cleanName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 25) || 'Conectados';
    const cleanCity = city.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9 ]/g, "").substring(0, 15) || 'BR';

    const merchantName = format(ID_MERCHANT_NAME, cleanName);
    const merchantCity = format(ID_MERCHANT_CITY, cleanCity);

    const txId = format('05', 'DOACAOCONECTADOS');
    const additionalData = format(ID_ADDITIONAL_DATA_FIELD_TEMPLATE, txId);

    const payload = [
        format(ID_PAYLOAD_FORMAT_INDICATOR, '01'),
        merchantAccountInfo,
        mcc,
        currency,
        txAmount,
        country,
        merchantName,
        merchantCity,
        additionalData,
        ID_CRC16 + '04'
    ].join('');

    // Calculate CRC16-CCITT-FALSE
    let crc = 0xFFFF;
    for (let i = 0; i < payload.length; i++) {
        crc ^= payload.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
            if ((crc & 0x8000) !== 0) {
                crc = (crc << 1) ^ 0x1021;
            } else {
                crc = crc << 1;
            }
        }
    }
    crc = crc & 0xFFFF;
    const crcHex = crc.toString(16).toUpperCase().padStart(4, '0');

    return payload + crcHex;
}
