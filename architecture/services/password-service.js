const crypto = require('node:crypto');
const { promisify } = require('node:util');

const scrypt = promisify(crypto.scrypt);
const KEY_LENGTH = 64;
const SCRYPT_OPTIONS = {
    N: 32768,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024
};

const hashPassword = (password) => {
    const salt = crypto.randomBytes(16);

    return scrypt(password, salt, KEY_LENGTH, SCRYPT_OPTIONS)
        .then((derivedKey) => [
            'scrypt',
            SCRYPT_OPTIONS.N,
            SCRYPT_OPTIONS.r,
            SCRYPT_OPTIONS.p,
            salt.toString('hex'),
            derivedKey.toString('hex')
        ].join('$'));
};

const verifyPassword = (password, encodedHash) => {
    if (typeof encodedHash !== 'string') return Promise.resolve(false);

    const [algorithm, cost, blockSize, parallelization, saltHex, hashHex, ...extra] =
        encodedHash.split('$');

    if (
        algorithm !== 'scrypt' ||
        Number(cost) !== SCRYPT_OPTIONS.N ||
        Number(blockSize) !== SCRYPT_OPTIONS.r ||
        Number(parallelization) !== SCRYPT_OPTIONS.p ||
        !/^[a-f0-9]{32}$/i.test(saltHex || '') ||
        !/^[a-f0-9]{128}$/i.test(hashHex || '') ||
        extra.length > 0
    ) {
        return Promise.resolve(false);
    }

    return scrypt(
        password,
        Buffer.from(saltHex, 'hex'),
        KEY_LENGTH,
        SCRYPT_OPTIONS
    ).then((derivedKey) => crypto.timingSafeEqual(
        derivedKey,
        Buffer.from(hashHex, 'hex')
    ));
};

module.exports = {
    hashPassword,
    verifyPassword
};
