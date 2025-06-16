import { EmbedBuilder } from 'discord.js';

export async function handleAboutDebsirinBot(interaction, client) {
  client.user.setActivity('เกี่ยวกับบอตเทพศิรินทร์', { type: 0 });

  const embed = new EmbedBuilder()
    .setTitle('🤖 เกี่ยวกับบอตเทพศิรินทร์')
    .setDescription('บอตเทพศิรินทร์ พัฒนาโดย PingzGP (ปิง) DSA139 IEP💚💛')
    .setColor('#00FF00') // สีเขียวสดใส
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });

  setTimeout(() => {
    client.user.setActivity('รอรับคำสั่งจากเด็กเทพศิรินทร์', { type: 3 });
  }, 3000);
}
