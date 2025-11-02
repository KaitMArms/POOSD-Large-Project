module.exports = () => {

    // Characters to be used for OTP (One-Time-Password / Could add more characters)
    let digits = '0123456789';
    // Holder
    let OTP = '';

    // Genereate 6 random characters and append. Could make bigger
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * digits.length)];
    }
    return OTP;

}