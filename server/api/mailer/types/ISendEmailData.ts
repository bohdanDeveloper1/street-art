import {EmailType} from '~/server/api/mailer/types/EmailType'

export interface ISendEmailData {
    to: string,
    subject: string,
    text: string,
    emailType: EmailType,
    html?: string
}