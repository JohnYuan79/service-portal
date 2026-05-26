const STORAGE_KEY = "service_portal_user";

const TEMP_ACCESS_CODE = "1234";

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
    schedule: {
        title: "전체일정",
        body: "전체 봉사 일정 달력 화면이 들어갈 영역입니다."
    },
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

function validateLogin(name, accessCode) {
    if (!name || name.length < 2) {
        return "이름을 2글자 이상 입력해 주세요.";
    }

    if (!accessCode) {
        return "접근코드를 입력해 주세요.";
    }

    if (accessCode !== TEMP_ACCESS_CODE) {
        return "접근코드가 맞지 않습니다.";
    }

    return "";
}

function renderTab(tabName) {
    const tab = tabMap[tabName];

    tabContent.innerHTML = `
    <h3>${tab.title}</h3>
    <p>${tab.body}</p>
  `;

    navItems.forEach((item) => {
        item.classList.toggle("active", item.dataset.tab === tabName);
    });
}

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = userNameInput.value.trim();
    const accessCode = accessCodeInput.value.trim();

    const errorMessage = validateLogin(name, accessCode);

    if (errorMessage) {
        loginMessage.textContent = errorMessage;
        return;
    }

    const user = {
        name,
        loggedInAt: new Date().toISOString()
    };

    saveUser(user);
    loginMessage.textContent = "";
    showMain(user);
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
// 