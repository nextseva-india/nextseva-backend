function generateTxnId(type){

  const now = new Date();

  const dd = String(now.getDate()).padStart(2,'0');
  const mm = String(now.getMonth()+1).padStart(2,'0');
  const yy = String(now.getFullYear()).slice(-2);

  const hh = String(now.getHours()).padStart(2,'0');
  const min = String(now.getMinutes()).padStart(2,'0');
  const ss = String(now.getSeconds()).padStart(2,'0');

  const random = Math.floor(1000 + Math.random() * 9000);

  return `NS${dd}${mm}${yy}${hh}${min}${ss}${type}${random}`;
}

module.exports = generateTxnId;