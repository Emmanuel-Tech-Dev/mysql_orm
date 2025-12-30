const temp = {
  otpTemplateOld: (otp) => {
    const html = `
        <body style="font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff;">
  <table role="presentation"
    style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: rgb(239, 239, 239);">
    <tbody>
      <tr>
        <td align="center" style="padding: 1rem 2rem; vertical-align: top; width: 100%;">
          <table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
            <tbody>
              <tr>
                <td style="padding: 40px 0px 0px;">
                  <div style="text-align: left;">
                  </div>
                  <div style="padding: 20px; background-color: rgb(255, 255, 255);">
                    <div style="color: rgb(0, 0, 0); text-align: left;">
                      <h1 style="margin: 1rem 0">Verification code</h1>
                      <p style="padding-bottom: 16px">Please use the verification code below to sign in.</p>
                      <p style="padding-bottom: 16px"><strong style="font-size: 130%">${otp}</strong></p>
                         <p style="padding-bottom: 16px"><em>The code will expire in <b>25 minutes</b> and can be used only once.</em></p>
                      <p style="padding-bottom: 16px">If you didn’t request this, you can ignore this email.</p>
                      <p style="padding-bottom: 16px">Thanks,<br>The Mailmeteor team</p>
                    </div>
                  </div>
                  <div style="padding-top: 20px; color: rgb(153, 153, 153); text-align: center;">
                    <p style="padding-bottom: 16px">Made with ♥ in Paris</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>
        
        `;

    return html;
  },

  otpTemplateV1: (otp) => {
    const numStr = String(otp); // Convert to string: "123456"

    const part1 = numStr.slice(0, 3); // Extracts characters from index 0 up to (but not including) index 3
    const part2 = numStr.slice(3);
    const html = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Authentication Code</title>
    <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f6f7f8; }

        @media screen and (max-width: 480px) {
            .container { width: 100% !important; }
            .content-padding { padding: 30px 20px !important; }
            .otp-text { font-size: 32px !important; letter-spacing: 0.15em !important; }
        }
    </style>
</head>
<body style="font-family: 'Inter', Helvetica, Arial, sans-serif;">
    <center>
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f6f7f8; table-layout: fixed;">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                    
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; margin-bottom: 24px;">
                        <tr>
                            <td align="center">
                                <table border="0" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td bgcolor="#137fec" style="padding: 6px; border-radius: 8px;">
                                            <span style="font-size: 20px; line-height: 1;">🛡️</span>
                                        </td>
                                        <td style="padding-left: 10px; font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.02em;">
                                            SecureAuth
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>

                    <table class="container" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
                        
                        <tr>
                            <td height="6" style="background-color: #3b82f6; background-image: linear-gradient(to right, #3b82f6, #4f46e5); font-size: 1px; line-height: 1px;">&nbsp;</td>
                        </tr>

                        <tr>
                            <td class="content-padding" style="padding: 40px; text-align: center;">
                                
                                <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin-bottom: 24px;">
                                    <tr>
                                        <td width="64" height="64" align="center" bgcolor="#eff6ff" style="border-radius: 32px; border: 1px solid #dbeafe;">
                                            <span style="font-size: 28px;">🔒</span>
                                        </td>
                                    </tr>
                                </table>

                                <h1 style="margin: 0 0 12px 0; color: #0f172a; font-size: 24px; font-weight: 700;">Authentication Code</h1>
                                
                                <p style="margin: 0 0 32px 0; color: #64748b; font-size: 14px; line-height: 1.6; max-width: 320px; margin-left: auto; margin-right: auto;">
                                    Please enter the following one-time password (OTP) to verify your account request.
                                </p>

                                <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f8fafc" style="border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 12px;">
                                    <tr>
                                        <td align="center" style="padding: 24px;">
                                            <span class="otp-text" style="font-family: 'Courier New', Courier, monospace; font-size: 40px; font-weight: 800; color: #1e293b; letter-spacing: 0.2em;">${part1} ${part2}</span>
                                        </td>
                                    </tr>
                                </table>

                                <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin-bottom: 32px;">
                                    <tr>
                                        <td style="color: #64748b; font-size: 12px; font-weight: 500;">
                                            <span style="margin-right: 4px;">🕒</span> Code expires in 10 minutes
                                        </td>
                                    </tr>
                                </table>

                                <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#fef2f2" style="border: 1px solid #fee2e2; border-radius: 8px;">
                                    <tr>
                                        <td style="padding: 16px;">
                                            <table border="0" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td valign="top" style="padding-right: 12px; font-size: 18px;">🛡️</td>
                                                    <td align="left">
                                                        <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 700; color: #b91c1c;">Do not share this code</p>
                                                        <p style="margin: 0; font-size: 12px; color: #ef4444; line-height: 1.4;">
                                                            SecureAuth employees will never ask for this code. If you didn't request this, simply ignore this message.
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <tr>
                            <td bgcolor="#f8fafc" style="padding: 16px; border-top: 1px solid #f1f5f9; text-align: center;">
                                <a href="#" style="color: #137fec; font-size: 14px; font-weight: 600; text-decoration: none;">Having trouble verifying? &rarr;</a>
                            </td>
                        </tr>
                    </table>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; margin-top: 32px; text-align: center;">
                        <tr>
                            <td>
                                <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 0 0 16px 0;">
                                    You received this email because a login request was made for your account.<br>
                                    <a href="#" style="color: #64748b; text-decoration: underline;">Manage notifications</a> or <a href="#" style="color: #64748b; text-decoration: underline;">Unsubscribe</a>.
                                </p>
                                <p style="color: #cbd5e1; font-size: 12px; margin: 0;">
                                    © 2024 SecureAuth Inc. &bull; Privacy Policy
                                </p>
                            </td>
                        </tr>
                    </table>

                </td>
            </tr>
        </table>
    </center>
</body>
</html>`;

    return html;
  },

  otpTemplate: (otp) => {
    const digits = Array.from(String(otp), Number);

    console.log(digits); // [1, 2, 3, 4, 5, 6]

    const html = `
       <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Email Verification</title>
    <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f6f7f8; }

        @media screen and (max-width: 600px) {
            .container { width: 100% !important; }
            .otp-box { width: 35px !important; height: 45px !important; font-size: 18px !important; }
            .content-padding { padding: 30px 20px !important; }
        }
    </style>
</head>
<body style=" font-family: 'Inter', Helvetica, Arial, sans-serif;">
    <center>
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f6f7f8; table-layout: fixed;">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                    <table class="container" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
                        
                        <tr>
                            <td height="140" style="background-color: #137fec; background-image: linear-gradient(to right, #137fec, #8b5cf6); text-align: center;">
                                <div style="color: #ffffff; font-size: 24px; font-weight: bold; opacity: 0.2;">● ○ ● ○ ● ○</div>
                                </td>
                        </tr>

                        <tr>
                            <td class="content-padding" style="padding: 40px 50px;">
                                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px;">
                                    <tr>
                                        <td align="center">
                                            <span style="font-size: 32px; vertical-align: middle;">🛡️</span>
                                            <span style="font-size: 20px; font-weight: 700; color: #0f172a; margin-left: 8px;">SecureAuth</span>
                                        </td>
                                    </tr>
                                </table>

                                <div style="text-align: center; margin-bottom: 24px;">
                                    <h1 style="margin: 0 0 8px 0; color: #0f172a; font-size: 26px; font-weight: 700;">Verify your email address</h1>
                                    <p style="margin: 0; color: #64748b; font-size: 16px;">Hi there, welcome to our platform!</p>
                                </div>

                                <p style="text-align: center; color: #334155; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
                                    To complete your sign-up request, please enter the verification code below. This code is for your account security.
                                </p>

                                <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin-bottom: 24px;">
                                    <tr>
                                        <td style="padding: 20px; background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 12px;">
                                            <table border="0" cellpadding="0" cellspacing="8">
                                                <tr>
                                                    <td class="otp-box" width="48" height="56" bgcolor="#e7edf3" style="border-radius: 8px; text-align: center; font-size: 24px; font-weight: 700; color: #0f172a;">${digits[0]}</td>
                                                    <td class="otp-box" width="48" height="56" bgcolor="#e7edf3" style="border-radius: 8px; text-align: center; font-size: 24px; font-weight: 700; color: #0f172a;">${digits[1]}</td>
                                                    <td class="otp-box" width="48" height="56" bgcolor="#e7edf3" style="border-radius: 8px; text-align: center; font-size: 24px; font-weight: 700; color: #0f172a;">${digits[2]}</td>
                                                    <td class="otp-box" width="48" height="56" bgcolor="#e7edf3" style="border-radius: 8px; text-align: center; font-size: 24px; font-weight: 700; color: #0f172a;">${digits[3]}</td>
                                                    <td class="otp-box" width="48" height="56" bgcolor="#e7edf3" style="border-radius: 8px; text-align: center; font-size: 24px; font-weight: 700; color: #0f172a;">${digits[4]}</td>
                                                    <td class="otp-box" width="48" height="56" bgcolor="#e7edf3" style="border-radius: 8px; text-align: center; font-size: 24px; font-weight: 700; color: #0f172a;">${digits[5]}</td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <p style="text-align: center; color: #64748b; font-size: 14px; margin-bottom: 32px;">
                                    This code expires in <span style="font-weight: 600; color: #334155;">10 minutes</span>.
                                </p>

                                <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#fffbeb" style="border: 1px solid #fef3c7; border-radius: 8px; margin-bottom: 32px;">
                                    <tr>
                                        <td style="padding: 16px;">
                                            <table border="0" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td valign="top" style="padding-right: 12px; font-size: 20px;">⚠️</td>
                                                    <td>
                                                        <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 700; color: #92400e; text-transform: uppercase; letter-spacing: 0.05em;">Security Alert</p>
                                                        <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.4;">
                                                            If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <div style="border-top: 1px solid #f1f5f9; padding-top: 32px; text-align: center;">
                                    <p style="color: #94a3b8; font-size: 12px; margin-bottom: 16px;">Please do not reply to this email. This mailbox is not monitored.</p>
                                    <a href="#" style="background-color: #137fec; color: #ffffff; padding: 12px 24px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; display: inline-block;">Go to Dashboard</a>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding: 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
                                <p style="margin: 0 0 8px 0;">© 2025 SecureAuth Inc. All rights reserved.</p>
                                <p style="margin: 0 0 16px 0;">123 Innovation Drive, Tech Valley, CA 94043</p>
                                <p style="margin: 0;">
                                    <a href="#" style="color: #137fec; text-decoration: underline;">Privacy Policy</a> &nbsp;|&nbsp; 
                                    <a href="#" style="color: #137fec; text-decoration: underline;">Contact Support</a> &nbsp;|&nbsp; 
                                    <a href="#" style="color: #137fec; text-decoration: underline;">Unsubscribe</a>
                                </p>
                            </td>
                        </tr>
                    </table>
                    </td>
            </tr>
        </table>
    </center>
</body>
</html>
        `;

    return html;
  },

  passwordResetTemplatOld: (resetLink) => {
    const html = `<body style="font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff;">
  <table role="presentation"
    style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: rgb(239, 239, 239);">
    <tbody>
      <tr>
        <td align="center" style="padding: 1rem 2rem; vertical-align: top; width: 100%;">
          <table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
            <tbody>
              <tr>
                <td style="padding: 40px 0px 0px;">
                  <div style="text-align: left;">
                   </div>
                  <div style="padding: 20px; background-color: rgb(255, 255, 255);">
                    <div style="color: rgb(0, 0, 0); text-align: left;">
                      <h1 style="margin: 1rem 0">Trouble signing in?</h1>
                      <p style="padding-bottom: 16px">We've received a request to reset the password for this user account.</p>
                      <p style="padding-bottom: 16px"><a href="${resetLink}" target="_blank"
                          style="padding: 12px 24px; border-radius: 4px; color: #FFF; background: #2B52F5;display: inline-block;margin: 0.5rem 0;">Reset
                          your password</a></p>
                      <p style="padding-bottom: 16px">If you didn't ask to reset your password, you can ignore this email.</p>
                      <p style="padding-bottom: 16px">Thanks,<br>The Mailmeteor team</p>
                    </div>
                  </div>
                  <div style="padding-top: 20px; color: rgb(153, 153, 153); text-align: center;">
                    <p style="padding-bottom: 16px">Made with ♥ in Paris</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    </tbody>
  </table>
</body>`;

    return html;
  },

  passwordResetTemplate: (resetLink, email) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Password Reset</title>
    <style>
        /* Basic Reset */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: #f6f7f8; }

        /* Mobile Adjustments */
        @media screen and (max-width: 600px) {
            .container { width: 100% !important; }
            .content-padding { padding: 32px 20px !important; }
        }
    </style>
</head>
<body style=" font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <center>
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; background-color: #f6f7f8;">
            <tr>
                <td align="center" style="padding: 40px 10px;">
                    <table class="container" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #f1f5f9;">
                        
                        <tr>
                            <td align="center" style="padding: 32px; background-color: rgba(19, 127, 236, 0.05); border-bottom: 1px solid #f1f5f9;">
                                <div style="height: 48px; width: 48px; background-color: #137fec; border-radius: 8px; line-height: 48px; color: #ffffff; font-size: 24px; font-weight: bold; text-align: center;">
                                    <span style="font-family: Arial, sans-serif;">&#128274;</span>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td class="content-padding" style="padding: 48px 60px; text-align: center;">
                                <h1 style="margin: 0 0 16px 0; color: #0d141b; font-size: 30px; font-weight: 700; tracking: -0.025em; line-height: 1.2;">
                                    Reset your password
                                </h1>
                                <p style="margin: 0 0 32px 0; color: #4c739a; font-size: 16px; line-height: 1.6;">
                                    We received a request to reset the password for your account associated with <strong style="color: #0d141b;">${email}</strong>. If you made this request, please click the button below to create a new password.
                                </p>

                                <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 32px auto;">
                                    <tr>
                                        <td align="center" bgcolor="#137fec" style="border-radius: 8px;">
                                            <a href="${resetLink}" target="_blank" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
                                                Reset Password
                                            </a>
                                        </td>
                                    </tr>
                                </table>

                                <table border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 32px auto; background-color: #fffbeb; border-radius: 8px;">
                                    <tr>
                                        <td style="padding: 8px 16px; color: #b45309; font-size: 14px; font-weight: 500;">
                                            <span style="margin-right: 4px;">&#9201;</span> This link will expire in 20 minutes.
                                        </td>
                                    </tr>
                                </table>

                                <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 32px;">

                                <div style="text-align: left;">
                                    <p style="margin: 0 0 8px 0; color: #4c739a; font-size: 14px;">
                                        Button not working? Copy and paste this link into your browser:
                                    </p>
                                    <a href="${resetLink}" style="color: #137fec; font-size: 14px; word-break: break-all; text-decoration: none;">
                                        ${resetLink}
                                    </a>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding: 24px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
                                <p style="margin: 0 0 16px 0; color: #64748b; font-size: 12px; line-height: 1.5;">
                                    If you didn't request a password reset, you can safely ignore this email. Your password will not change until you access the link above and create a new one.
                                </p>
                                <p style="margin: 0 0 16px 0; color: #94a3b8; font-size: 12px; font-weight: 500;">
                                    <a href="#" style="color: #94a3b8; text-decoration: none;">Help Center</a> &nbsp; &bull; &nbsp; 
                                    <a href="#" style="color: #94a3b8; text-decoration: none;">Privacy Policy</a> &nbsp; &bull; &nbsp; 
                                    <a href="#" style="color: #94a3b8; text-decoration: none;">Contact Support</a>
                                </p>
                                <p style="margin: 0; color: #94a3b8; font-size: 11px; line-height: 1.5;">
                                    © 2025 Company Name Inc. All rights reserved.<br>
                                    123 Street Name, City, Country
                                </p>
                            </td>
                        </tr>
                    </table>
                    </td>
            </tr>
        </table>
    </center>
</body>
</html>`;

    return html;
  },
};

module.exports = temp;
