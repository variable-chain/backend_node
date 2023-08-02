
import config from "config";
import jwt from 'jsonwebtoken';
import fs from 'fs';
import nodemailer from 'nodemailer';
import cloudinary from 'cloudinary';

cloudinary.config({
  cloud_name: config.get('cloudinary.cloud_name'),
  api_key: config.get('cloudinary.api_key'),
  api_secret: config.get('cloudinary.api_secret')
});



module.exports = {

  getToken: async (payload) => {
    var token = await jwt.sign(payload, config.get('jwtsecret'))
    return token;
  },

  getOTP() {
    var otp = Math.floor(1000 + Math.random() * 9000);
    return otp;
  },

  sendMail: async (to, name, link) => {
    let html = `
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <table style="width:100%">
            <tr>
                <th><img src="https://res.cloudinary.com/dr8om5rtw/image/upload/v1687883538/bhfxcnspq9qjjlsnzudb.jpg" alt="Logo"
                        style="width:30%;height:30%;"></th>
            </tr>
        </table>
      </div>
      <p style="font-size:1.1em">Hi ${name},</p>
      <p>If you forgot your password, no worries: Click on reset button and we will send you a link you can use to pick a new password.</p>
      <div align="center">
        <a href="${config.get('web')}?token=${link}" target="_blank" style="box-sizing: border-box;display: inline-block;font-family:'Montserrat',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #0088ee; border-radius: 60px;-webkit-border-radius: 60px; -moz-border-radius: 60px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;border-top-color: #CCC; border-top-style: solid; border-top-width: 0px; border-left-color: #CCC; border-left-style: solid; border-left-width: 0px; border-right-color: #CCC; border-right-style: solid; border-right-width: 0px; border-bottom-color: #0275a4; border-bottom-style: solid; border-bottom-width: 5px;">
          <span style="display:block;padding:15px 40px 14px;line-height:120%;"><strong><span style="font-size: 16px; line-height: 19.2px;">RESET PASSWORD</span></strong></span>
        </a>
    </div>
      <p style="font-size:0.9em;">Regards,<br />Variable Exchange Team</p>
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      </div>
    </div>
  </div>`
    var transporter = nodemailer.createTransport({
      service: config.get('nodemailer.service'),
      auth: {
        "user": config.get('nodemailer.email'),
        "pass": config.get('nodemailer.password')
      },

    });
    var mailOptions = {
      from: config.get('nodemailer.from'),
      to: to,
      subject: 'Reset Link',
      html: html
    };
    return await transporter.sendMail(mailOptions)
  },

  subscribeMail: async (to, name, email) => {
    let html = `
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <table style="width:100%">
            <tr>
                <th><img src="https://res.cloudinary.com/dr8om5rtw/image/upload/v1687883538/bhfxcnspq9qjjlsnzudb.jpg" alt="Logo"
                        style="width:30%;height:30%;"></th>
            </tr>
        </table>
      </div>
      <p style="font-size:1.1em">Dear ${name} </p>
      <p>${email} has subscribe on your plateform for newsLetter.</p>
      <!--div align="center">
        <a href="${config.get('web')}?token=${email}" target="_blank" style="box-sizing: border-box;display: inline-block;font-family:'Montserrat',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFFFFF; background-color: #0088ee; border-radius: 60px;-webkit-border-radius: 60px; -moz-border-radius: 60px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;border-top-color: #CCC; border-top-style: solid; border-top-width: 0px; border-left-color: #CCC; border-left-style: solid; border-left-width: 0px; border-right-color: #CCC; border-right-style: solid; border-right-width: 0px; border-bottom-color: #0275a4; border-bottom-style: solid; border-bottom-width: 5px;">
          <span style="display:block;padding:15px 40px 14px;line-height:120%;"><strong><span style="font-size: 16px; line-height: 19.2px;">RESET PASSWORD</span></strong></span>
        </a>
    </div-->
      <p style="font-size:0.9em;">Regards,<br />Variable Exchange Team</p>
      <hr style="border:none;border-top:1px solid #eee" />
      <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      </div>
    </div>
  </div>`
    var transporter = nodemailer.createTransport({
      service: config.get('nodemailer.service'),
      auth: {
        "user": config.get('nodemailer.email'),
        "pass": config.get('nodemailer.password')
      },

    });
    var mailOptions = {
      from: config.get('nodemailer.from'),
      to: to,
      subject: 'NEWSLETTER_NOTIFICTAION',
      html: html
    };
    return await transporter.sendMail(mailOptions)
  },

  getSecureUrl: async (base64) => {
    var result = await cloudinary.v2.uploader.upload(base64);
    return result.secure_url;
  },

  getImageUrl: async (files) => {
    try {
      console.log('77 ==>', files)
      var result = await cloudinary.v2.uploader.upload(files[0].path, { resource_type: "auto" });
      return result.secure_url;
    } catch (error) {
      console.log("getImageUrl====>>", error)
    }
  },

  getImageUrlByPathObj: async (doc) => {
    var result = await cloudinary.v2.uploader.upload(doc.path, { resource_type: "auto" });
    return result.secure_url;
  },
  paginateGood: async (array, page_size, page_number) => {
    return array.slice((page_number - 1) * page_size, page_number * page_size);
  }
}
