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
  const text = `Bonjour,\n\nVotre ticket numéro #${ticketId} a été mis à jour.\n\nNouveau statut : ${newStatus}.\n\nMerci de votre confiance.`;
  
  await sendEmail(userEmail, subject, text);
};
// Fonction spécifique pour notifier un agent qu'il a été assigné à un ticket
const sendTicketAssignedEmail = async (agentEmail, ticketId , senderName, senderRole) => {
  const subject = `Nouveau ticket assigné #${ticketId}`;
  const text = `Bonjour,\n\nUn nouveau ticket vous a été assigné par ${senderName} (${senderRole}).\nNuméro du ticket : ${ticketId}.\n\nMerci de traiter cette demande rapidement.`;
  
  await sendEmail(agentEmail, subject, text);
};

module.exports = { sendEmail, sendTicketStatusUpdateEmail , sendTicketAssignedEmail };
