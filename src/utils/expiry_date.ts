function expiryDateCalculate() {
  let date = new Date();
  let expiryDate = date.setMinutes(date.getMinutes() + 2);
  return expiryDate;
}

function convertTimestampToUTC(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toUTCString();
}
