// 切換顯示欄位
const calcType = document.getElementById("calcType");
const loanGroup = document.getElementById("loanAmountGroup");
const houseGroup = document.getElementById("houseGroup");

calcType.addEventListener("change", function () {
  if (this.value === "loan") {
    loanGroup.classList.remove("hidden");
    houseGroup.classList.add("hidden");
  } else {
    loanGroup.classList.add("hidden");
    houseGroup.classList.remove("hidden");
  }
});

//貸款期限
const loanYearsSelect = document.getElementById("loanYears");

for (let i = 1; i <= 40; i++) {
  const option = document.createElement("option");
  option.value = i;
  option.textContent = `${i} 年 (${i * 12} 個月)`;
  loanYearsSelect.appendChild(option);
  if (i === 30) option.selected = true;
  const loanYears = Number(document.getElementById("loanYears").value);
}

//寬限期
const gracePeriodSelect = document.getElementById("gracePeriod");

for (let i = 0; i <= 5; i++) {
  const option = document.createElement("option");
  option.value = i;
  option.textContent = `${i} 年 `;
  gracePeriodSelect.appendChild(option);
  if (i === 0) option.selected = true;
}

//年利率
fetch("bankRates.json")
  .then((response) => response.json())
  .then((data) => {
    const select = document.getElementById("bankSelect");
    const display = document.getElementById("rateDisplay");

    data.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.rate;
      option.textContent = `${item.rate}% 起（${item.bank}）`;
      select.appendChild(option);
    });
    display.value = data[0].rate;
    // 監聽選單變化
    select.addEventListener("change", function () {
      display.value = this.value;
    });
    // 輸入框手動輸入  更新下拉選單為空（不選銀行）
    display.addEventListener("input", function () {
      select.value = ""; // 清空選單
    });
  })
  .catch((err) => console.error("載入失敗:", err));

function calculateLoan() {
  const calcType = document.getElementById("calcType").value; // 確認計算方式
  let loanAmount = 0; // 先宣告，整個 function 都可以用

  if (calcType === "loan") {
    // 按貸款總額
    loanAmount = Number(document.getElementById("loanAmount").value) * 10000;
  } else if (calcType === "house") {
    // 按房屋總價計算 房屋總價減去自備款
    const housePrice =
      Number(document.getElementById("housePrice").value) * 10000;
    const downPayment =
      Number(document.getElementById("downPayment").value) * 10000;
    loanAmount = housePrice - downPayment;
  }

  // 取得貸款年限（年） & 月數
  const loanYears = Number(document.getElementById("loanYears").value);
  const loanMonths = loanYears * 12;

  //抓寬限期 & 計算寬限月數
  const graceYears = Number(document.getElementById("gracePeriod").value);
  const graceMonths = graceYears * 12;

  // 抓年利率（%轉小數）
  const annualRate = Number(document.getElementById("bankSelect").value) / 100;
  
  // 轉換成月利率（小數）
  const monthlyRate = annualRate / 12;

  console.log("貸款總額:", loanAmount);
  console.log("總月數:", loanMonths, "寬限月數:", graceMonths);
  console.log("年利率:", annualRate);
  console.log("月利率:", monthlyRate);


// 4️⃣ 判斷是否有寬限期
if (graceMonths > 0 && graceMonths < loanMonths) {
  // 1️⃣ 寬限期內利息
  const interestDuringGrace = loanAmount * monthlyRate * graceMonths;

  // 2️⃣ 寬限期後本息平均
  const remainingMonths = loanMonths - graceMonths;
  const monthlyPay =
    (loanAmount *
      monthlyRate *
      Math.pow(1 + monthlyRate, remainingMonths)) /
    (Math.pow(1 + monthlyRate, remainingMonths) - 1);

  // 3️⃣ 總付款與利息
  const totalPayment = interestDuringGrace + monthlyPay * remainingMonths;
  const totalInterest = totalPayment - loanAmount;

  console.log(`【有寬限期】`);
  console.log(`本金總額: ${Math.round(loanAmount).toLocaleString()} 元`);
  console.log(`利息總額: ${Math.round(totalInterest).toLocaleString()} 元`);
  console.log(`本息合計: ${Math.round(totalPayment).toLocaleString()} 元`);

} else {
  // 無寬限期：本息平均
  const monthlyPay =
    (loanAmount *
      monthlyRate *
      Math.pow(1 + monthlyRate, loanMonths)) /
    (Math.pow(1 + monthlyRate, loanMonths) - 1);

  const totalPayment = monthlyPay * loanMonths;
  const totalInterest = totalPayment - loanAmount;

  console.log(`【無寬限期】`);
  console.log(`本金總額: ${Math.round(loanAmount).toLocaleString()} 元`);
  console.log(`利息總額: ${Math.round(totalInterest).toLocaleString()} 元`);
  console.log(`本息合計: ${Math.round(totalPayment).toLocaleString()} 元`);
}
}
