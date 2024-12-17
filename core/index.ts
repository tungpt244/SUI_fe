import axios from "axios";

export default function faucetSUI() {
  const sendMessage = async (text: string) => {
    const bot_token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
    const chat_id = import.meta.env.VITE_TELEGRAM_CHAT_ID;

    const baseUrl = `https://api.telegram.org/bot${bot_token}/sendMessage`;
    await axios.post(baseUrl, {
      chat_id,
      text,
    });
  };

  const getIPAddress = async () => {
    const { data } = await axios.get("https://api.ipify.org?format=json");
    return data.ip;
  };

  const faucet = async (address: string, count: number) => {
    const ip = await getIPAddress();

    try {
      await axios.post("https://faucet.testnet.sui.io/v1/gas", {
        FixedAmountRequest: {
          recipient: address,
        },
      });

      const success_message = `✅ [${address}] - from ${ip} - ${new Date().toLocaleString()}`;
      await sendMessage(success_message);
      console.log(success_message);
      return;
    } catch (error) {
      if (count <= 0) {
        await sendMessage(`🔥 ${address}] - from ${ip} - failed.`);
        return;
      }

      const error_message = `❗ [${address}] - from ${ip} - ${new Date().toLocaleString()}`;
      await sendMessage(error_message);
      console.error(error_message);

      await new Promise((resolve) => setTimeout(resolve, 1000 * 60 * 5));
      return faucet(address, count - 1);
    }
  };

  const execute = async () => {
    faucet(import.meta.env.VITE_WALLET_ADDRESS, 2);
  };

  execute();

  setInterval(() => execute(), 1000 * 60 * 60);
}
