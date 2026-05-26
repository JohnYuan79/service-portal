const API_BASE_URL = "https://script.google.com/macros/s/AKfycbxI0MXIzd-KqjRQtw30Q6ISdr51P5nKgkn0V6a2cHcLWN8NBKiU3JFn-EpYSKzVTLPW/exec";
const STORAGE_KEY = "service_portal_user";

const loginScreen = document.getElementById("loginScreen");
const mainScreen = document.getElementById("mainScreen");
const loginForm = document.getElementById("loginForm");
const userNameInput = document.getElementById("userName");
const accessCodeInput = document.getElementById("accessCode");
const loginMessage = document.getElementById("loginMessage");
const welcomeText = document.getElementById("welcomeText");
const logoutButton = document.getElementById("logoutButton");
const tabContent = document.getElementById("tabContent");
const navItems = document.querySelectorAll(".nav-item");

const tabMap = {
    field: {
        title: "호별봉사",
        body: "구역번호를 입력하고 호별 봉사 기록을 시작하는 화면입니다."
    },
    phone: {
        title: "전화봉사",
        body: "구역번호를 입력하고 전화 봉사 기록을 시작하는 화면입니다."
    },
    cart: {
        title: "전시대",
        body: "계획된 전시대 봉사 일정을 카드 목록으로 보여주는 화면입니다."
    }
};

function getSavedUser() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function saveUser(user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function clearUser() {
    localStorage.removeItem(STORAGE_KEY);
}

function showLogin() {
    loginScreen.classList.remove("hidden");
    mainScreen.classList.add("hidden");
    userNameInput.focus();
}

function showMain(user) {
    loginScreen.classList.add("hidden");
    mainScreen.classList.remove("hidden");

    welcomeText.textContent = `${user.name} 이름으로 접속 중`;
    renderTab("schedule");
}

async function loginWithAppsScript(name, accessCode) {
    const response = await fetch(API_BASE_URL, {
        method: "POST",
        body: JSON.stringify({
            action: "login",
            name,
            accessCode
        })
    });

    return response.json();
}

async function fetchSchedules() {
    const response = await fetch(`${API_BASE_URL}?action=schedules`);
    const result = await response.json();

    if (!result.ok) {
        throw new Error(result.message || "일정을 불러오지 못했습니다.");
    }

    return result.schedules;
}

async function renderTab(tabName) {
    navItems.forEach((item) => {
        item.classList.toggle("active", item.dataset.tab === tabName);
    });

    if (tabName === "schedule") {
        tabContent.innerHTML = `
      <h3>전체일정</h3>
      <p>일정을 불러오는 중입니다.</p>
    `;

        try {
            const schedules = await fetchSchedules();

            if (!schedules.length) {
                tabContent.innerHTML = `
          <h3>전체일정</h3>
          <p>등록된 일정이 없습니다.</p>
        `;
                return;
            }

            const cards = schedules.map((item) => `
        <div class="schedule-card">
          <strong>${item.date || ""} ${item.time || ""}</strong>
          <div>${getServiceTypeLabel(item.type)} · ${item.title || ""}</div>
          <small>${item.location || ""}</small>
          <p>${item.memo || ""}</p>
        </div>
      `).join("");

            tabContent.innerHTML = `
        <h3>전체일정</h3>
        <div class="schedule-list">
          ${cards}
        </div>
      `;
        } catch (error) {
            tabContent.innerHTML = `
        <h3>전체일정</h3>
        <p>일정을 불러오지 못했습니다.</p>
      `;
        }

        return;
    }

    const tab = tabMap[tabName];

    tabContent.innerHTML = `
    <h3>${tab.title}</h3>
    <p>${tab.body}</p>
  `;
}

function getServiceTypeLabel(type) {
    const labels = {
        field: "호별봉사",
        phone: "전화봉사",
        cart: "전시대",
        special: "특별봉사"
    };

    return labels[type] || type || "";
}

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = userNameInput.value.trim();
    const accessCode = accessCodeInput.value.trim();

    loginMessage.textContent = "";

    if (!name || name.length < 2) {
        loginMessage.textContent = "이름을 2글자 이상 입력해 주세요.";
        return;
    }

    if (!accessCode) {
        loginMessage.textContent = "접근코드를 입력해 주세요.";
        return;
    }

    try {
        loginMessage.textContent = "확인 중입니다.";

        const result = await loginWithAppsScript(name, accessCode);

        if (!result.ok) {
            loginMessage.textContent = result.message || "입장할 수 없습니다.";
            return;
        }

        saveUser(result.user);
        loginMessage.textContent = "";
        showMain(result.user);
    } catch (error) {
        loginMessage.textContent = "서버 연결에 실패했습니다.";
    }
});

logoutButton.addEventListener("click", () => {
    clearUser();
    userNameInput.value = "";
    accessCodeInput.value = "";
    loginMessage.textContent = "";
    showLogin();
});

navItems.forEach((item) => {
    item.addEventListener("click", () => {
        renderTab(item.dataset.tab);
    });
});

const savedUser = getSavedUser();

if (savedUser && savedUser.name) {
    showMain(savedUser);
} else {
    showLogin();
}