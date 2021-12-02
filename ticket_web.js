let datas;
axios
  .get(
    'https://raw.githubusercontent.com/hexschool/js-training/main/travelApi.json'
  )
  .then(function (response) {
    datas = response.data.data;
    chartDataInit();
    console.log(datas);
    render();
    calculatorChartData(datas);
  })
  .catch(function (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    }
  });

function render(location) {
  const list = document.querySelector('.ticketCard-area');
  let str = '';
  const cacheData = datas.filter((item) => {
    if (item.area == location) {
      areaName = location;
      return item;
    }
    if (!location) {
      return item;
    }
  });
  const searchResult_text = document.querySelector('#searchResult-text');

  cacheData.forEach((item) => {
    str += `<li class="ticketCard">
  <div class="ticketCard-img">
      <a href="#">
          <img src="${item.imgUrl}"
              alt="">
      </a>
      <div class="ticketCard-region">${item.area}</div>
      <div class="ticketCard-rank">${item.rate}</div>
  </div>
  <div class="ticketCard-content">
      <div>
          <h3>
              <a href="#" class="ticketCard-name">${item.name}</a>
          </h3>
          <p class="ticketCard-description">
             ${item.description}
          </p>
      </div>
      <div class="ticketCard-info">
          <p class="ticketCard-num">
              <span><i class="fas fa-exclamation-circle"></i></span>
              剩下最後 <span id="ticketCard-num"> ${item.group}</span> 組
          </p>
          <p class="ticketCard-price">
              TWD <span id="ticketCard-price">${item.price}</span>
          </p>
      </div>
  </div>
  </li>`;
  });
  searchResult_text.textContent = `本次搜尋共${cacheData.length}筆資料`;

  list.innerHTML = str;
  return;
}

const regionSearch = document.querySelector('.regionSearch');
// BUG 選擇過城市後，新增套票無法重新變成全部區域selected
//const regionSearchSelected = document.querySelector(
//   '.regionSearch option[selected]'
// );
const ticketForm = document.querySelector('.addTicket-form');

regionSearch.addEventListener('change', function () {
  render(regionSearch.value);
});

//*****表單驗證＋新增功能********//

//**onblur和onchange就會驗證一次是否空值show出必填**/
//選取document裡面的forms元素節點
const formsElemnt = document.forms['addTicket-form'];
//check每個傳入element的值，讓每個傳入驗證的節點為上面的formsElement陣列的元素
function checkFormData(element) {
  //console.log(element);
  let name = element['name']; //取元素name屬性的值
  const p = document.querySelector(`.alert-message p[data-message="${name}"]`); //選取 .alert-message 子層的p的data-message是name的
  if (element.value == '' || element.value == null) {
    p.classList.remove('d-none');
  } else {
    p.classList.add('d-none');
    return;
  }
}
// checkFormData(formElemnt[0]);

//** 用formData webAPI取值新稱and在驗證一次 **/
//submit時又在驗證一次，可以才新增data
ticketForm.addEventListener('submit', (e) => {
  e.preventDefault();
  console.log(`有觸發`);
  const formData = new FormData(ticketForm);
  const name = formData.get('ticketName');
  const region = formData.get('ticketRegion');
  const description = formData.get('ticketDescription');
  const Num = formData.get('ticketNum');
  const price = formData.get('ticketPrice');
  const rate = formData.get('ticketRate');
  const imgUrl = formData.get('ticketImgUrl');
  //TODO 網址或檔案開頭路徑 ->可以再弄清楚一點正規表達式
  const urlRegex = /(http|https|files):\/\/([[a-zA-Z0-9])?/gi;
  if (!urlRegex.test(imgUrl)) {
    alert(`僅接受網址及檔案路徑（ex:http or https or files:// ），請重新輸入`);
    return;
  }
  if (rate > 10) {
    alert('最大星級只有10');
    return;
  }
  if (
    name == '' ||
    name == null ||
    region == '' ||
    region == null ||
    Num == null ||
    Num == '' ||
    price == '' ||
    price == null ||
    description == '' ||
    description == null
  ) {
    alert(`這欄位不能空白喔`);
    return;
  }

  let obj = {
    id: Date.now(),
    name: name,
    imgUrl: imgUrl,
    area: region,
    description: description,
    group: Num,
    price: price,
    rate: rate,
  };
  datas.push(obj);
  ticketForm.reset();
  render();
  calculatorChartData(datas);
});

/*****chart*****/
const chartData = {
  columns: [],
  colors: {},
};
const chartDataInit = function () {
  const cityNamelist = document.querySelectorAll('#ticketRegion > option');
  console.log(cityNamelist);
  cityNamelist.forEach((item) => {
    if (item.value !== '') {
      chartData.columns.push([item.value, 0]);
      if (chartData.colors[item.value] !== '') {
        chartData.colors[item.value] = `#${Math.floor(
          Math.random() * 26777314
        ).toString(16)}`;
      }
    }
  });
};

const calculatorChartData = (data) => {
  const areaData = {};
  data.forEach((item) => {
    if (!areaData[item.area]) {
      areaData[item.area] = 0;
    }
    areaData[item.area]++;
  });

  chartData.columns.forEach((item) => {
    item[1] = areaData[item[0]];
  });

  let chart = c3.generate({
    //bindto: '#chart',
    data: {
      columns: chartData.columns,
      type: 'donut',
    },
    donut: {
      title: '套票地區比重',
      label: {
        show: false,
      },
      width: 30,
    },

    colors: chartData.colors,
  });
  c;
};
