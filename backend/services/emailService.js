const nodemailer = require('nodemailer');

// Création du transporteur SMTP
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,  // 👈 Utiliser host personnalisé
    port: process.env.EMAIL_PORT,  // 👈 Utiliser port personnalisé
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

// Fonction générique pour envoyer un email
const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email envoyé à ${to}`);
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
  }
};

// Fonction spécifique pour notifier du changement de statut
const sendTicketStatusUpdateEmail = async (userEmail, ticketId, newStatus) => {
  const subject = `Mise à jour du ticket #${ticketId}`;
  const text = `Bonjour,\n\nLe statut de votre ticket a été mis à jour : ${newStatus}.\n\nMerci de votre confiance.`;
  
  await sendEmail(userEmail, subject, text);
};

module.exports = { sendEmail, sendTicketStatusUpdateEmail };
