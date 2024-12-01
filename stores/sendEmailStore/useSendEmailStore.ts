import {defineStore} from 'pinia'
import type {ISendEmailData} from '~/server/api/mailer/types/ISendEmailData'
import {sendEmail} from '~/server/app/services/email/emailService'

export const useSendEmailStore = defineStore('sendEmail', () => {

    async function sendMail(mailData: ISendEmailData) {
        await $fetch('api/mailer', {
            method: 'post',
            body: mailData,
        })
    }

    return{
        sendEmail,
    }
})