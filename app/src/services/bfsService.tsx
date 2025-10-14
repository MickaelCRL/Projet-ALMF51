import api from "../api";

export async function getBFSAsync(toto: string) {
  console.log("test");
  const response = await api.get(`/`);

  return response.data;
}
