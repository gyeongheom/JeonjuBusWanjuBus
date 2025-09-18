const fetchButton = document.getElementById('fetchButton');
const busInput = document.getElementById('bus-number-input');

fetchButton.addEventListener('click', () => {
    const busNumber = busInput.value;

    if (!busNumber) {
        alert("버스 번호를 입력해주세요");
        return;
    }

    // ⛔️ 수정 1: 잘못된 따옴표와 변수 삽입 방식 수정
    // 그냥 따옴표(')가 아니라 백틱(`)을 사용해야 합니다.
    // 변수를 넣을 때 ${busNumber} 형태로 감싸야 합니다.
    const apiUrl = `https://apis.data.go.kr/1613000/BusRouteInfoInqireService/getRouteNoList?serviceKey=faa7d3563b27ed1b9102af7943638b8cbaa1bf7847ab445b84728cff497ef518&cityCode=35010&routeNo=${busNumber}`;

    fetch(apiUrl)
        .then(response => response.text())
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");

            // API 응답에 routeid가 없을 수 있으므로 확인
            const routeIdNode = xmlDoc.querySelector("routeid");
            if (!routeIdNode) {
                alert("해당 버스 노선 정보가 없습니다. (API 응답 확인 필요)");
                return; // 여기서 멈추도록 return을 추가하는 것이 좋습니다.
            }
            const routeId = routeIdNode.textContent;

            // 두 번째 API 호출 (정류장 목록 가져오기)
            const stationListUrl = `https://apis.data.go.kr/1613000/BusRouteInfoInqireService/getRouteAcctoThrghSttnList?serviceKey=faa7d3563b27ed1b9102af7943638b8cbaa1bf7847ab445b84728cff497ef518&cityCode=35010&routeId=${routeId}&numOfRows=100`;
            return fetch(stationListUrl);
        })
        .then(response => {
            // 응답이 유효한지 확인하는 로직 추가
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");
            
            // "item" 태그를 먼저 모두 찾은 후, 각 item에서 정류소 이름을 찾습니다.
            const items = xmlDoc.querySelectorAll("item");
            const listContainer = document.getElementById('bus-stops-list');
            listContainer.innerHTML = ''; // 이전 목록 초기화

            if (items.length === 0) {
                const listItem = document.createElement('li');
                listItem.textContent = '정류장 정보가 없습니다.';
                listContainer.appendChild(listItem);
                return;
            }

            items.forEach(item => {
                // ⛔️ 수정 2: 각 정류장 데이터(item) 안에서 nodenm을 찾아야 합니다.
                const stationNameNode = item.querySelector('nodenm');
                if (stationNameNode) {
                    const stationName = stationNameNode.textContent;
                    const listItem = document.createElement('li');
                    listItem.textContent = stationName;
                    listContainer.appendChild(listItem);
                }
            });
        })
        .catch(error => {
            console.error('에러 발생: ', error);
            alert('데이터를 가져오는 중 오류가 발생했습니다.');
        });
});