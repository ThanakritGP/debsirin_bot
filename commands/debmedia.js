import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from 'discord.js';

export async function handleDebmedia(interaction, client) {
  client.user.setActivity('รูปถ่ายจาก DEB MEDIA', { type: 0 });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setLabel('Debmedia')
      .setStyle(ButtonStyle.Link)
      .setURL('https://sites.google.com/debsirin.ac.th/debmedia/debmedia')
      .setEmoji('<:debmedia:1354297615105134766>')
  );

  await interaction.reply({
    content: '📩 **Download pictures here!**',
    components: [row]
  });

  setTimeout(() => {
    client.user.setActivity('รอรับคำสั่งจากเด็กเทพศิรินทร์', { type: 3 });
  }, 3000);
}
