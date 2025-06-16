import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';

export async function handleContact(interaction, client) {
  client.user.setActivity('ช่องทางติดต่อ', { type: 0 });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('งานประชาสัมพันธ์ โรงเรียนเทพศิรินทร์')
      .setStyle(ButtonStyle.Link)
      .setURL('https://www.facebook.com/PRdebsirin')
      .setEmoji('<:Facebook:1354294377911947274>'),

    new ButtonBuilder()
      .setLabel('คณะกรรมการบริหารนักเรียนเทพศิรินทร์')
      .setStyle(ButtonStyle.Link)
      .setURL('https://www.facebook.com/DebsirinSC')
      .setEmoji('<:Facebook:1354294377911947274>'),

    new ButtonBuilder()
      .setLabel('PR Debsirin Instagram')
      .setStyle(ButtonStyle.Link)
      .setURL('https://www.instagram.com/pr.debsirin_official/')
      .setEmoji('<:Instagram:1354294380684513382>'),

    new ButtonBuilder()
      .setLabel('DebsirinSC Instagram')
      .setStyle(ButtonStyle.Link)
      .setURL('https://www.instagram.com/debsirinsc/')
      .setEmoji('<:Instagram:1354294380684513382>')
  );

  await interaction.reply({
    content: '📩 **Contact Us!**',
    components: [row]
  });

  setTimeout(() => {
    client.user.setActivity('รอรับคำสั่งจากเด็กเทพศิรินทร์', { type: 3 });
  }, 3000);
}
