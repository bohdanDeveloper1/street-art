import type {ISendEmailData} from '~/server/api/mailer/types/ISendEmailData'
import {sendEmail} from '~/server/app/services/email/emailService'

export default defineEventHandler(async (event) => {
    const body: ISendEmailData = await readBody(event)
    if(!body) throw createError({statusCode: 400, message: 'No parameters in request body'})
    await sendEmail(body)

    return {
      statusCode: 200,
    }
})



//const id = getRouterParam(event, "id")
//const result = await $fetch('http://localhost:3000/api/users/' + id)
