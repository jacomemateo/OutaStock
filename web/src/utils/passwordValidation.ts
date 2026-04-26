const PASSWORD_HELPER_TEXT =
    'Password must be at least 8 characters and include one uppercase letter, one number, and one symbol.';

export function getPasswordValidationMessage(password: string) {
    if (!password) {
        return '';
    }

    const isLongEnough = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);

    if (isLongEnough && hasUppercase && hasNumber && hasSymbol) {
        return '';
    }

    return PASSWORD_HELPER_TEXT;
}

export function isPasswordComplexEnough(password: string) {
    return getPasswordValidationMessage(password) === '';
}
