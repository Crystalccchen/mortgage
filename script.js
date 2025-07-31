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

    // 先加入「自訂利率」選項
    const customOption = document.createElement("option");
    customOption.value = "custom";
    customOption.textContent = "自訂利率";
    select.appendChild(customOption);

    //各銀行利率
    data.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.rate;
      option.textContent = `${item.rate}% 起（${item.bank}）`;
      select.appendChild(option);
    });
    display.value = data[0].rate;
    select.selectedIndex = 1; // 選擇第一個銀行（index 1，因為 0 是自訂選項）
    // 監聽選單變化
    select.addEventListener("change", function () {
      display.value = this.value;
    });
    // 輸入框手動輸入  更新下拉選單為空（不選銀行）
    display.addEventListener("input", function () {});
  })
  .catch((err) => console.error("載入失敗:", err));

function calculateLoan() {
  const calcType = document.getElementById("calcType").value;
  let loanAmount = 0;

  // 計算貸款金額
  if (calcType === "loan") {
    loanAmount = Number(document.getElementById("loanAmount").value) * 10000;
  } else {
    const housePrice =
      Number(document.getElementById("housePrice").value) * 10000;
    const downPayment =
      Number(document.getElementById("downPayment").value) * 10000;
    loanAmount = housePrice - downPayment;
  }

  // 取得貸款年限 & 月數
  const loanYears = Number(document.getElementById("loanYears").value);
  const loanMonths = loanYears * 12;

  // 寬限期
  const graceYears = Number(document.getElementById("gracePeriod").value);
  const graceMonths = graceYears * 12;

  // 年利率（優先取手動輸入框）
  const rateInput = Number(document.getElementById("rateDisplay").value);
  const annualRate = rateInput / 100;
  const monthlyRate = annualRate / 12;

  // ------------------------------
  // 1️⃣ 等額本息（本息平均）
  // ------------------------------
  function calcEqualPrincipalInterest(principal, months, graceMonths = 0) {
    if (months <= graceMonths) return null; // 全部寬限期不合理

    const realMonths = months - graceMonths;
    const monthlyPay =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, realMonths)) /
      (Math.pow(1 + monthlyRate, realMonths) - 1);

    const interestDuringGrace = principal * monthlyRate * graceMonths;
    const totalPayment = interestDuringGrace + monthlyPay * realMonths;
    const totalInterest = totalPayment - principal;

    return { monthlyPay, totalInterest, totalPayment };
  }

  // ------------------------------
  // 2️⃣ 等額本金（本金平均）
  // ------------------------------
  function calcEqualPrincipal(principal, months, graceMonths = 0) {
    const realMonths = months - graceMonths;
    const monthlyPrincipal = principal / realMonths;
    let totalInterest = 0;

    // 計算利息總額
    for (let i = 0; i < realMonths; i++) {
      const remain = principal - monthlyPrincipal * i;
      totalInterest += remain * monthlyRate;
    }

    const interestDuringGrace = principal * monthlyRate * graceMonths;
    totalInterest += interestDuringGrace;

    const totalPayment = principal + totalInterest;
    const firstMonthPay = monthlyPrincipal + principal * monthlyRate;

    return { monthlyPrincipal, totalInterest, totalPayment, firstMonthPay };
  }

  // 計算兩種方式
  const eqPI = calcEqualPrincipalInterest(loanAmount, loanMonths, graceMonths);
  const eqP = calcEqualPrincipal(loanAmount, loanMonths, graceMonths);

  // ------------------------------
  // 顯示結果
  // 本息平均攤還
  const eqpiCard = document.getElementById("result-eqpi");
  eqpiCard.querySelector(".monthly").textContent = `${Math.round(
    eqPI.monthlyPay
  ).toLocaleString()} 元/月`;
  eqpiCard.querySelector(".principal").textContent = `本金（${Math.round(
    loanAmount / 10000
  )} 萬元）`;
  eqpiCard.querySelector(".interest").textContent = `利息（${Math.round(
    eqPI.totalInterest / 10000
  )} 萬元）`;
  eqpiCard.querySelector(".total").textContent = `本息合計（${Math.round(
    eqPI.totalPayment / 10000
  )} 萬元）`;

  // 本金平均攤還
  const eqpCard = document.getElementById("result-eqp");
  eqpCard.querySelector(".monthly").textContent = `${Math.round(
    eqP.firstMonthPay
  ).toLocaleString()} 元/月`;
  eqpCard.querySelector(".principal").textContent = `本金（${Math.round(
    loanAmount / 10000
  )} 萬元）`;
  eqpCard.querySelector(".interest").textContent = `利息（${Math.round(
    eqP.totalInterest / 10000
  )} 萬元）`;
  eqpCard.querySelector(".total").textContent = `本息合計（${Math.round(
    eqP.totalPayment / 10000
  )} 萬元）`;
}
