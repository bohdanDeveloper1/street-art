import {ISendEmailData} from '~/server/api/mailer/types/ISendEmailData'

export async function sendEmail (request: ISendEmailData) {
    const {sendMail} = useNodeMailer()
    // todo: 1. make email strategies, depend on: request.emailType
    //  2. get email strategy
    return sendMail({
        subject: request.subject,
        text: request.text,
        to: request.to
        //html: request.template.html
    })
}
