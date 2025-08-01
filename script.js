// document.querySelectorAll('input[name="type"]').forEach((radio) => {
//   radio.addEventListener('change', () => {
//     const selected = document.querySelector('input[name="type"]:checked');

//     const rateTypeSelect = document.getElementById("rateTypeSelect");
//     const singleRate = document.querySelector(".single-rate");
//     const multiRateSection = document.getElementById("multiRateSection");

//     if (selected.classList.contains("youth")) {
//       // 青安：強制使用多段利率，隱藏利率方式選單與單一利率欄位
//       rateTypeSelect.parentElement.style.display = "none";
//       singleRate.style.display = "none";
//       multiRateSection.style.display = "block";
//     } else {
//       // 一般 or 組合：顯示利率選單，根據選擇的利率方式顯示欄位
//       rateTypeSelect.parentElement.style.display = "block";

//       if (rateTypeSelect.value === "multi") {
//         singleRate.style.display = "none";
//         multiRateSection.style.display = "block";
//       } else {
//         singleRate.style.display = "block";
//         multiRateSection.style.display = "none";
//       }
//     }
//   });
// });



document.querySelectorAll('input[name="type"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const selected = document.querySelector('input[name="type"]:checked');

    const rateTypeSelect = document.getElementById("rateTypeSelect");
    const singleRate = document.querySelector(".single-rate");
    const multiRateSection = document.getElementById("multiRateSection");
    const youthMultiRateSection = document.getElementById("youthMultiRateSection");

    if (selected.classList.contains("youth")) {
      // 青安貸款：隱藏利率方式選單，隱藏一般利率區塊，顯示青安多段利率
      rateTypeSelect.parentElement.style.display = "none";
      singleRate.style.display = "none";
      multiRateSection.style.display = "block";
    } else if (selected.classList.contains("combine")) {
      // 組合貸款：利率方式選單顯示，顯示青安多段利率和一般利率區塊（單一或多段由利率選擇決定）
      rateTypeSelect.parentElement.style.display = "block";
      youthMultiRateSection.style.display = "block";

      if (rateTypeSelect.value === "multi") {
        singleRate.style.display = "none";
        multiRateSection.style.display = "block";
      } else {
        singleRate.style.display = "block";
        multiRateSection.style.display = "none";
      }
    } else {
      // 一般貸款：利率方式選單顯示，青安多段利率隱藏，顯示單一或多段利率
      rateTypeSelect.parentElement.style.display = "block";
      youthMultiRateSection.style.display = "none";

      if (rateTypeSelect.value === "multi") {  //單一利率 或多段利率
        singleRate.style.display = "none"; 
        multiRateSection.style.display = "block";
      } else {
        singleRate.style.display = "block";
        multiRateSection.style.display = "none";
      }
    }
  });
});

// 頁面載入時觸發初始化
window.addEventListener('DOMContentLoaded', () => {
  document.querySelector('input[name="type"]:checked').dispatchEvent(new Event('change'));
});




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
const gracePeriodSelect = document.getElementsByClassName("gracePeriod")[0];

for (let i = 0; i <= 5; i++) {
  const option = document.createElement("option");
  option.value = i;
  option.textContent = `${i} 年 `;
  gracePeriodSelect.appendChild(option);
  if (i === 0) option.selected = true;
}
// 切換利率方式顯示
const rateTypeSelect = document.querySelector("select[value], select option"); // 直接用你設定的 id 更好
const singleRate = document.querySelector(".single-rate");
const multiRateSection = document.getElementById("multiRateSection");

document
  .getElementById("rateTypeSelect")
  .addEventListener("change", function () {
    const isMulti = this.value === "multi";
    singleRate.style.display = isMulti ? "none" : "block";
    multiRateSection.style.display = isMulti ? "block" : "none";
  });

function validateMultiRates(loanYears) {
  const totalMonths = loanYears * 12;

  const startMonths = document.querySelectorAll(".start-month");
  const endMonths = document.querySelectorAll(".end-month");
  const rates = document.querySelectorAll(".rate");

  let multiRates = [];

  for (let i = 0; i < startMonths.length; i++) {
    const start = parseInt(startMonths[i].value, 10);
    const end = parseInt(endMonths[i].value, 10);
    const rate = parseFloat(rates[i].value);

    // 檢查是否完整輸入
    if (isNaN(start) || isNaN(end) || isNaN(rate)) {
      alert(`第 ${i + 1} 段利率輸入不完整`);
      return null;
    }

    // 檢查起始與結束邏輯
    if (start > end || start < 1 || end > totalMonths) {
      alert(`第 ${i + 1} 段月份輸入不正確 (1 ~ ${totalMonths})`);
      return null;
    }

    multiRates.push({ startMonth: start, endMonth: end, rate: rate });
  }

  // 依照 startMonth 排序
  multiRates.sort((a, b) => a.startMonth - b.startMonth);

  // 驗證段數連續性
  for (let i = 0; i < multiRates.length; i++) {
    if (i === 0 && multiRates[i].startMonth !== 1) {
      alert(`第一段必須從第 1 個月開始`);
      return null;
    }
    if (i > 0 && multiRates[i].startMonth !== multiRates[i - 1].endMonth + 1) {
      alert(
        `第 ${i + 1} 段必須緊接上一段月份 (${
          multiRates[i - 1].endMonth + 1
        } 開始)`
      );
      return null;
    }
  }

  // 驗證最後一段是否剛好等於貸款總月數
  if (multiRates[multiRates.length - 1].endMonth !== totalMonths) {
    alert(`最後一段必須剛好到第 ${totalMonths} 月`);
    return null;
  }

  return multiRates; // 驗證成功返回陣列
}

function calcMultiRatePI(principal, rateSegments, graceMonths = 0) {
  let remainPrincipal = principal;
  let totalInterest = 0;
  let totalPayment = 0;
  let firstMonthPay = 0;
  let monthIndex = 0;

  for (let seg of rateSegments) {
    const months = seg.endMonth - seg.startMonth + 1;
    const monthlyRate = seg.rate / 100 / 12;

    for (let i = 0; i < months; i++) {
      monthIndex++;

      if (monthIndex <= graceMonths) {
        // 寬限期只繳利息
        const interest = remainPrincipal * monthlyRate;
        totalInterest += interest;
        totalPayment += interest;
        if (monthIndex === 1) firstMonthPay = interest;
        continue;
      }

      // 依剩餘期數計算當月等額本息
      const remainMonths = (rateSegments.at(-1).endMonth) - monthIndex + 1;
      const monthlyPay =
        (remainPrincipal * monthlyRate * Math.pow(1 + monthlyRate, remainMonths)) /
        (Math.pow(1 + monthlyRate, remainMonths) - 1);

      const interest = remainPrincipal * monthlyRate;
      const principalPay = monthlyPay - interest;

      remainPrincipal -= principalPay;
      totalInterest += interest;
      totalPayment += monthlyPay;

      if (monthIndex === graceMonths + 1) firstMonthPay = monthlyPay;
    }
  }

  return { firstMonthPay, totalInterest, totalPayment };
}


function calcMultiRateP(principal, rateSegments, graceMonths = 0) {
  const totalMonths = rateSegments.reduce(
    (sum, seg) => sum + (seg.endMonth - seg.startMonth + 1),
    0
  );
  const realMonths = totalMonths - graceMonths;
  const monthlyPrincipal = principal / realMonths;

  let remainPrincipal = principal;
  let totalInterest = 0;
  let totalPayment = 0;
  let firstMonthPay = 0;
  let monthIndex = 0;

  for (let seg of rateSegments) {
    const months = seg.endMonth - seg.startMonth + 1;
    const monthlyRate = seg.rate / 100 / 12;

    for (let i = 0; i < months; i++) {
      monthIndex++;

      if (monthIndex <= graceMonths) {
        const interest = remainPrincipal * monthlyRate;
        totalInterest += interest;
        totalPayment += interest;
        if (monthIndex === 1) firstMonthPay = interest;
        continue;
      }

      const interest = remainPrincipal * monthlyRate;
      const pay = monthlyPrincipal + interest;

      remainPrincipal -= monthlyPrincipal;
      totalInterest += interest;
      totalPayment += pay;

      if (monthIndex === graceMonths + 1) firstMonthPay = pay;
    }
  }

  return { firstMonthPay, totalInterest, totalPayment, monthlyPrincipal };
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
  const rateType = document.getElementById("rateTypeSelect").value;

  // 1️⃣ 計算貸款金額
  let loanAmount = 0;
  if (calcType === "loan") {
    loanAmount = Number(document.getElementById("loanAmount").value) * 10000;
  } else {
    const housePrice =
      Number(document.getElementById("housePrice").value) * 10000;
    const downPayment =
      Number(document.getElementById("downPayment").value) * 10000;
    loanAmount = housePrice - downPayment;
  }

  // 2️⃣ 計算期數與寬限期
  const loanYears = Number(document.getElementById("loanYears").value);
  const loanMonths = loanYears * 12;
  const graceYears = Number(document.getElementsByClassName("gracePeriod")[0]);
  const graceMonths = graceYears * 12;

  // 4️⃣ 判斷利率方式
  if (rateType === "single") {
    // 🔹 單一利率
    const rateInput = Number(document.getElementById("rateDisplay").value);
    const monthlyRate = rateInput / 100 / 12;

    const eqPI = calcEqualPrincipalInterest(
      loanAmount,
      loanMonths,
      graceMonths,
      monthlyRate
    );
    const eqP = calcEqualPrincipal(
      loanAmount,
      loanMonths,
      graceMonths,
      monthlyRate
    );

    // 顯示結果
    updateResultCards(eqPI, eqP, loanAmount);
  } else {
    // 多段利率
    const multiRates = validateMultiRates(loanYears);
    if (!multiRates) return; // 驗證失敗就中斷

    const multiPI = calcMultiRatePI(loanAmount, multiRates, graceMonths);
    const multiP = calcMultiRateP(loanAmount, multiRates, graceMonths);
    updateMultiResultCard(multiPI, multiP, loanAmount);
  }
} // ------------------------------

// 1️⃣ 等額本息（本息平均）
// ------------------------------
function calcEqualPrincipalInterest(
  principal,
  months,
  graceMonths = 0,
  monthlyRate
) {
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
function calcEqualPrincipal(principal, months, graceMonths = 0, monthlyRate) {
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

// ------------------------------
// 顯示結果
function updateResultCards(eqPI, eqP, loanAmount) {
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

function updateMultiResultCard(multiPI, multiP, loanAmount) {
  // 等額本息
  const eqpiCard = document.getElementById("result-eqpi");
  eqpiCard.querySelector(".monthly").textContent =
    ` ${Math.round(multiPI.firstMonthPay).toLocaleString()} 元/月`;
  eqpiCard.querySelector(".principal").textContent =
    `本金（${Math.round(loanAmount / 10000)} 萬元）`;
  eqpiCard.querySelector(".interest").textContent =
    `利息（${Math.round(multiPI.totalInterest / 10000)} 萬元）`;
  eqpiCard.querySelector(".total").textContent =
    `本息合計（${Math.round(multiPI.totalPayment / 10000)} 萬元）`;

  // 等額本金
  const eqpCard = document.getElementById("result-eqp");
  eqpCard.querySelector(".monthly").textContent =
    ` ${Math.round(multiP.firstMonthPay).toLocaleString()} 元/月`;
  eqpCard.querySelector(".principal").textContent =
    `本金（${Math.round(loanAmount / 10000)} 萬元）`;
  eqpCard.querySelector(".interest").textContent =
    `利息（${Math.round(multiP.totalInterest / 10000)} 萬元）`;
  eqpCard.querySelector(".total").textContent =
    `本息合計（${Math.round(multiP.totalPayment / 10000)} 萬元）`;
}
