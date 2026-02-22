export default function formatRupiah(angka:number,options?: { removeRp?: boolean }) {
  let currency = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(angka);

  if(isNaN(angka)) return "Rp 0";
  return options?.removeRp ? currency.replace("Rp", "").trim() : currency;
}