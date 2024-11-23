export enum PasswordErrorType {
    LessThan8Characters = 'less-than-8-characters',
    NoUppercaseLetter = 'no-upper-case-letter',
    NoLowercaseLetter = 'no-lower-case-letter',
    NoDigit = 'no-digit',
    NoSpecialCharacter = 'no-special-character',
}