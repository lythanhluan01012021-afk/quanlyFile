/**
 * NexusAuth - Modern Authentication & Google Quick Sign-In
 * Handles login, registration, password analysis, Google OAuth & simulated flow
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // STATE MANAGEMENT & LOCAL STORAGE
  // ==========================================
  const STORAGE_KEYS = {
    THEME: 'nexus_theme',
    CURRENT_USER: 'nexus_current_user',
    REGISTERED_USERS: 'nexus_users',
    GOOGLE_CLIENT_ID: 'nexus_google_client_id',
    REMEMBERED_EMAIL: 'nexus_remembered_email'
  };

  // Pre-seed demo user if empty
  if (!localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS)) {
    const demoUsers = [
      {
        fullname: 'Nguyễn Văn Demo',
        email: 'demo@nexus.com',
        password: 'Password@123',
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(demoUsers));
  }

  // ==========================================
  // DOM ELEMENTS
  // ==========================================
  // Header & Theme
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const googleConfigBtn = document.getElementById('googleConfigBtn');

  // Containers
  const authContainer = document.getElementById('authContainer');
  const userProfileCard = document.getElementById('userProfileCard');
  const toastContainer = document.getElementById('toastContainer');

  // Tabs
  const tabSliderContainer = document.querySelector('.tabs-header');
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegisterBtn = document.getElementById('tabRegisterBtn');
  const cardTitle = document.getElementById('cardTitle');
  const cardSubtitle = document.getElementById('cardSubtitle');

  // Forms
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const rememberMe = document.getElementById('rememberMe');
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');

  const regFullName = document.getElementById('regFullName');
  const regEmail = document.getElementById('regEmail');
  const regPassword = document.getElementById('regPassword');
  const regConfirmPassword = document.getElementById('regConfirmPassword');
  const agreeTerms = document.getElementById('agreeTerms');
  const registerSubmitBtn = document.getElementById('registerSubmitBtn');

  // Password Strength
  const strengthBar = document.getElementById('strengthBar');
  const strengthText = document.getElementById('strengthText');
  const ruleLength = document.getElementById('ruleLength');
  const ruleUpper = document.getElementById('ruleUpper');
  const ruleNumber = document.getElementById('ruleNumber');
  const ruleSpecial = document.getElementById('ruleSpecial');
  const confirmMatchBadge = document.getElementById('confirmMatchBadge');

  // Google Sign-In & Modals
  const googleSignInBtn = document.getElementById('googleSignInBtn');
  const googleBtnText = document.getElementById('googleBtnText');
  const googleChooserModal = document.getElementById('googleChooserModal');
  const closeGoogleModalBtn = document.getElementById('closeGoogleModalBtn');
  const googleAccountItems = document.querySelectorAll('.google-account-item:not(.custom-account)');
  const customGoogleAccountOption = document.getElementById('customGoogleAccountOption');

  // Forgot Password Modal
  const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
  const forgotPasswordModal = document.getElementById('forgotPasswordModal');
  const closeForgotModalBtn = document.getElementById('closeForgotModalBtn');
  const forgotPasswordForm = document.getElementById('forgotPasswordForm');
  const resetEmail = document.getElementById('resetEmail');

  // Google Config Modal
  const googleConfigModal = document.getElementById('googleConfigModal');
  const closeConfigModalBtn = document.getElementById('closeConfigModalBtn');
  const googleConfigForm = document.getElementById('googleConfigForm');
  const googleClientIdInput = document.getElementById('googleClientIdInput');
  const resetGoogleConfigBtn = document.getElementById('resetGoogleConfigBtn');

  // Profile Card Elements
  const userAvatar = document.getElementById('userAvatar');
  const userNameDisplay = document.getElementById('userNameDisplay');
  const userEmailDisplay = document.getElementById('userEmailDisplay');
  const authMethodText = document.getElementById('authMethodText');
  const loginTimestamp = document.getElementById('loginTimestamp');
  const sessionIdText = document.getElementById('sessionIdText');
  const logoutBtn = document.getElementById('logoutBtn');
  const dashboardBtn = document.getElementById('dashboardBtn');

  // ==========================================
  // THEME INITIALIZATION
  // ==========================================
  const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    showToast('Giao diện', `Đã chuyển sang chế độ ${newTheme === 'dark' ? 'tối' : 'sáng'}`, 'info');
  });

  // Remembered email check
  const rememberedEmail = localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL);
  if (rememberedEmail && loginEmail) {
    loginEmail.value = rememberedEmail;
    rememberMe.checked = true;
  }

  // ==========================================
  // TAB SWITCHING (LOGIN <-> REGISTER)
  // ==========================================
  function switchTab(mode) {
    clearErrors();
    if (mode === 'login') {
      tabLoginBtn.classList.add('active');
      tabRegisterBtn.classList.remove('active');
      tabSliderContainer.classList.remove('register-active');

      cardTitle.textContent = 'Chào mừng trở lại!';
      cardSubtitle.textContent = 'Vui lòng đăng nhập để tiếp tục trải nghiệm hệ thống';
      googleBtnText.textContent = 'Đăng nhập nhanh với Google';

      loginForm.classList.remove('hidden-form');
      loginForm.classList.add('active-form');
      registerForm.classList.add('hidden-form');
      registerForm.classList.remove('active-form');
    } else {
      tabRegisterBtn.classList.add('active');
      tabLoginBtn.classList.remove('active');
      tabSliderContainer.classList.add('register-active');

      cardTitle.textContent = 'Tạo tài khoản mới';
      cardSubtitle.textContent = 'Bắt đầu trải nghiệm các tính năng bảo mật tuyệt vời';
      googleBtnText.textContent = 'Đăng ký nhanh với Google';

      registerForm.classList.remove('hidden-form');
      registerForm.classList.add('active-form');
      loginForm.classList.add('hidden-form');
      loginForm.classList.remove('active-form');
    }
  }

  tabLoginBtn.addEventListener('click', () => switchTab('login'));
  tabRegisterBtn.addEventListener('click', () => switchTab('register'));

  // ==========================================
  // PASSWORD VISIBILITY TOGGLE
  // ==========================================
  document.querySelectorAll('.toggle-password-btn').forEach(button => {
    button.addEventListener('click', () => {
      const input = button.parentElement.querySelector('input');
      const eyeOpen = button.querySelector('.eye-open');
      const eyeClosed = button.querySelector('.eye-closed');

      if (input.type === 'password') {
        input.type = 'text';
        eyeOpen.classList.add('hidden');
        eyeClosed.classList.remove('hidden');
      } else {
        input.type = 'password';
        eyeOpen.classList.remove('hidden');
        eyeClosed.classList.add('hidden');
      }
    });
  });

  // ==========================================
  // PASSWORD STRENGTH ANALYSIS
  // ==========================================
  function checkPasswordRules(password) {
    const rules = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password) && /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };

    updateRuleUI(ruleLength, rules.length);
    updateRuleUI(ruleUpper, rules.upper);
    updateRuleUI(ruleNumber, rules.number);
    updateRuleUI(ruleSpecial, rules.special);

    const score = Object.values(rules).filter(Boolean).length;
    return { score, rules };
  }

  function updateRuleUI(element, isValid) {
    if (isValid) {
      element.classList.add('valid');
      element.querySelector('.rule-icon').textContent = '✓';
    } else {
      element.classList.remove('valid');
      element.querySelector('.rule-icon').textContent = '✕';
    }
  }

  if (regPassword) {
    regPassword.addEventListener('input', () => {
      const val = regPassword.value;
      if (!val) {
        strengthBar.style.width = '0%';
        strengthBar.style.backgroundColor = 'transparent';
        strengthText.textContent = 'Chưa nhập';
        strengthText.style.color = 'var(--text-dim)';
        checkPasswordRules('');
        return;
      }

      const { score } = checkPasswordRules(val);

      switch (score) {
        case 1:
          strengthBar.style.width = '25%';
          strengthBar.style.backgroundColor = 'var(--danger)';
          strengthText.textContent = 'Yếu';
          strengthText.style.color = 'var(--danger)';
          break;
        case 2:
          strengthBar.style.width = '50%';
          strengthBar.style.backgroundColor = 'var(--warning)';
          strengthText.textContent = 'Trung bình';
          strengthText.style.color = 'var(--warning)';
          break;
        case 3:
          strengthBar.style.width = '75%';
          strengthBar.style.backgroundColor = '#3b82f6';
          strengthText.textContent = 'Khá mạnh';
          strengthText.style.color = '#3b82f6';
          break;
        case 4:
          strengthBar.style.width = '100%';
          strengthBar.style.backgroundColor = 'var(--success)';
          strengthText.textContent = 'Rất mạnh / An toàn';
          strengthText.style.color = 'var(--success)';
          break;
        default:
          strengthBar.style.width = '15%';
          strengthBar.style.backgroundColor = 'var(--danger)';
          strengthText.textContent = 'Rất yếu';
          strengthText.style.color = 'var(--danger)';
      }

      checkPasswordMatch();
    });
  }

  // Confirm Password Live Match Check
  function checkPasswordMatch() {
    if (!regConfirmPassword) return;
    const pwd = regPassword.value;
    const confirm = regConfirmPassword.value;

    if (confirm && pwd === confirm) {
      confirmMatchBadge.classList.remove('hidden');
      regConfirmPassword.classList.add('input-success');
      regConfirmPassword.classList.remove('input-error');
      clearFieldError('regConfirmPassword');
    } else {
      confirmMatchBadge.classList.add('hidden');
      regConfirmPassword.classList.remove('input-success');
    }
  }

  if (regConfirmPassword) {
    regConfirmPassword.addEventListener('input', checkPasswordMatch);
  }

  // ==========================================
  // ERROR & VALIDATION UTILITIES
  // ==========================================
  function showFieldError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errorSpan = document.getElementById(fieldId + 'Error');
    if (input) input.classList.add('input-error');
    if (errorSpan) {
      errorSpan.textContent = message;
      errorSpan.classList.add('visible');
    }
  }

  function clearFieldError(fieldId) {
    const input = document.getElementById(fieldId);
    const errorSpan = document.getElementById(fieldId + 'Error');
    if (input) input.classList.remove('input-error');
    if (errorSpan) {
      errorSpan.textContent = '';
      errorSpan.classList.remove('visible');
    }
  }

  function clearErrors() {
    document.querySelectorAll('.form-input').forEach(i => i.classList.remove('input-error', 'input-success'));
    document.querySelectorAll('.error-msg').forEach(e => {
      e.textContent = '';
      e.classList.remove('visible');
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // ==========================================
  // LOGIN SUBMISSION HANDLER
  // ==========================================
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors();

      const email = loginEmail.value.trim();
      const password = loginPassword.value;
      let hasError = false;

      if (!email) {
        showFieldError('loginEmail', 'Vui lòng nhập địa chỉ email');
        hasError = true;
      } else if (!isValidEmail(email)) {
        showFieldError('loginEmail', 'Email không đúng định dạng');
        hasError = true;
      }

      if (!password) {
        showFieldError('loginPassword', 'Vui lòng nhập mật khẩu');
        hasError = true;
      }

      if (hasError) return;

      // Start button loading state
      setButtonLoading(loginSubmitBtn, true);

      setTimeout(() => {
        setButtonLoading(loginSubmitBtn, false);

        // Check against mock database
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS) || '[]');
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user || user.password !== password) {
          showFieldError('loginPassword', 'Email hoặc mật khẩu không chính xác');
          showToast('Đăng nhập thất bại', 'Thông tin đăng nhập không hợp lệ', 'error');
          return;
        }

        // Remember Me Handler
        if (rememberMe.checked) {
          localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, email);
        } else {
          localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
        }

        // Successful Login
        const authPayload = {
          fullname: user.fullname || user.email.split('@')[0],
          email: user.email,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.email)}`,
          provider: 'Email & Mật khẩu',
          verified: false,
          loginAt: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN'),
          sessionId: 'SES-' + Math.random().toString(36).substring(2, 9).toUpperCase()
        };

        saveSessionAndDisplay(authPayload);
        showToast('Thành công', `Xin chào mừng, ${authPayload.fullname}!`, 'success');
      }, 700);
    });
  }

  // ==========================================
  // REGISTER SUBMISSION HANDLER
  // ==========================================
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors();

      const fullname = regFullName.value.trim();
      const email = regEmail.value.trim();
      const password = regPassword.value;
      const confirmPassword = regConfirmPassword.value;
      let hasError = false;

      if (!fullname) {
        showFieldError('regFullName', 'Vui lòng nhập họ và tên của bạn');
        hasError = true;
      }

      if (!email) {
        showFieldError('regEmail', 'Vui lòng nhập địa chỉ email');
        hasError = true;
      } else if (!isValidEmail(email)) {
        showFieldError('regEmail', 'Email không đúng định dạng');
        hasError = true;
      }

      const { score } = checkPasswordRules(password);
      if (!password) {
        showFieldError('regPassword', 'Vui lòng tạo mật khẩu');
        hasError = true;
      } else if (score < 2) {
        showFieldError('regPassword', 'Mật khẩu còn quá yếu, vui lòng đáp ứng thêm tiêu chí');
        hasError = true;
      }

      if (!confirmPassword) {
        showFieldError('regConfirmPassword', 'Vui lòng nhập lại mật khẩu');
        hasError = true;
      } else if (password !== confirmPassword) {
        showFieldError('regConfirmPassword', 'Mật khẩu xác nhận không khớp');
        hasError = true;
      }

      if (!agreeTerms.checked) {
        const termsError = document.getElementById('termsError');
        if (termsError) {
          termsError.textContent = 'Bạn cần đồng ý với Điều khoản dịch vụ để đăng ký';
          termsError.classList.add('visible');
        }
        hasError = true;
      }

      if (hasError) return;

      // Check if email already exists
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.REGISTERED_USERS) || '[]');
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        showFieldError('regEmail', 'Email này đã được sử dụng. Hãy đăng nhập.');
        showToast('Trùng email', 'Email đã tồn tại trong hệ thống', 'error');
        return;
      }

      setButtonLoading(registerSubmitBtn, true);

      setTimeout(() => {
        setButtonLoading(registerSubmitBtn, false);

        // Save new user
        const newUser = {
          fullname,
          email,
          password,
          createdAt: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem(STORAGE_KEYS.REGISTERED_USERS, JSON.stringify(users));

        showToast('Đăng ký thành công', 'Tài khoản của bạn đã được tạo thành công!', 'success');

        // Automatically log user in
        const authPayload = {
          fullname,
          email,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
          provider: 'Email & Mật khẩu',
          verified: true,
          loginAt: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN'),
          sessionId: 'SES-' + Math.random().toString(36).substring(2, 9).toUpperCase()
        };
        saveSessionAndDisplay(authPayload);
      }, 800);
    });
  }

  // ==========================================
  // GOOGLE QUICK SIGN-IN (OFFICIAL & SIMULATOR)
  // ==========================================
  function initGoogleIdentity() {
    const configuredClientId = localStorage.getItem(STORAGE_KEYS.GOOGLE_CLIENT_ID);

    if (configuredClientId && window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: configuredClientId,
          callback: handleGoogleOfficialCallback,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Prompt Google One Tap
        window.google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            console.log('Google One Tap không hiển thị hoặc bị bỏ qua');
          }
        });
      } catch (err) {
        console.warn('Lỗi khởi tạo Google GIS:', err);
      }
    }
  }

  // Official JWT credential decoder
  function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  }

  function handleGoogleOfficialCallback(response) {
    if (!response.credential) return;
    const payload = parseJwt(response.credential);
    if (!payload) {
      showToast('Lỗi', 'Không thể giải mã dữ liệu Google OAuth', 'error');
      return;
    }

    const authPayload = {
      fullname: payload.name || 'Người dùng Google',
      email: payload.email,
      avatar: payload.picture || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
      provider: 'Tài khoản Google (Chính thức)',
      verified: true,
      loginAt: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN'),
      sessionId: 'SES-GOOG-' + Math.random().toString(36).substring(2, 9).toUpperCase()
    };

    saveSessionAndDisplay(authPayload);
    showToast('Google Sign-In', `Đăng nhập thành công với ${payload.email}`, 'success');
  }

  // Google Sign-In Button Click
  if (googleSignInBtn) {
    googleSignInBtn.addEventListener('click', () => {
      const configuredClientId = localStorage.getItem(STORAGE_KEYS.GOOGLE_CLIENT_ID);
      if (configuredClientId && window.google?.accounts?.id) {
        // Trigger Google One Tap or GIS client
        window.google.accounts.id.prompt();
      } else {
        // Open rich simulated Google Account Chooser
        openModal(googleChooserModal);
      }
    });
  }

  // Handle click on simulated Google accounts
  googleAccountItems.forEach(item => {
    item.addEventListener('click', () => {
      const name = item.dataset.name;
      const email = item.dataset.email;
      const avatar = item.dataset.avatar;

      closeModal(googleChooserModal);
      showToast('Đang xác thực Google', 'Đang kết nối tài khoản an toàn...', 'info');

      setTimeout(() => {
        const authPayload = {
          fullname: name,
          email: email,
          avatar: avatar,
          provider: 'Tài khoản Google',
          verified: true,
          loginAt: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN'),
          sessionId: 'SES-GOOG-' + Math.random().toString(36).substring(2, 9).toUpperCase()
        };

        saveSessionAndDisplay(authPayload);
        showToast('Google Sign-In', `Đăng nhập thành công với tài khoản ${name}!`, 'success');
      }, 600);
    });
  });

  // Custom Account Prompt inside Google Modal
  if (customGoogleAccountOption) {
    customGoogleAccountOption.addEventListener('click', () => {
      const customEmail = prompt('Nhập địa chỉ Gmail của bạn để kiểm thử:');
      if (customEmail && isValidEmail(customEmail)) {
        closeModal(googleChooserModal);
        const name = customEmail.split('@')[0].replace(/[._-]/g, ' ');
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

        showToast('Đang xác thực Google', 'Đang kết nối tài khoản...', 'info');

        setTimeout(() => {
          const authPayload = {
            fullname: formattedName,
            email: customEmail,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}`,
            provider: 'Tài khoản Google',
            verified: true,
            loginAt: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN'),
            sessionId: 'SES-GOOG-' + Math.random().toString(36).substring(2, 9).toUpperCase()
          };

          saveSessionAndDisplay(authPayload);
          showToast('Google Sign-In', `Chào mừng ${formattedName}!`, 'success');
        }, 600);
      } else if (customEmail) {
        alert('Địa chỉ email không hợp lệ!');
      }
    });
  }

  // ==========================================
  // SESSION & PROFILE DISPLAY
  // ==========================================
  function saveSessionAndDisplay(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    renderUserProfile(user);
  }

  function renderUserProfile(user) {
    if (!user) return;

    userAvatar.src = user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80';
    userNameDisplay.textContent = user.fullname;
    userEmailDisplay.textContent = user.email;
    authMethodText.textContent = user.provider;
    loginTimestamp.textContent = user.loginAt;
    sessionIdText.textContent = user.sessionId;

    authContainer.classList.add('hidden');
    userProfileCard.classList.remove('hidden');
  }

  // Check if session exists on page load
  const activeSession = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (activeSession) {
    try {
      renderUserProfile(JSON.parse(activeSession));
    } catch (e) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }

  // Logout Handler
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      userProfileCard.classList.add('hidden');
      authContainer.classList.remove('hidden');
      switchTab('login');
      showToast('Đăng xuất', 'Bạn đã đăng xuất khỏi phiên làm việc an toàn', 'info');
    });
  }

  if (dashboardBtn) {
    dashboardBtn.addEventListener('click', () => {
      showToast('Bảng điều khiển', 'Đang chuyển hướng vào hệ thống quản lý...', 'success');
    });
  }

  // ==========================================
  // FORGOT PASSWORD FLOW
  // ==========================================
  if (forgotPasswordBtn) {
    forgotPasswordBtn.addEventListener('click', () => {
      if (loginEmail.value && isValidEmail(loginEmail.value)) {
        resetEmail.value = loginEmail.value;
      }
      openModal(forgotPasswordModal);
    });
  }

  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = resetEmail.value.trim();
      const sendResetBtn = document.getElementById('sendResetBtn');

      if (!email || !isValidEmail(email)) {
        showFieldError('resetEmail', 'Vui lòng nhập địa chỉ email hợp lệ');
        return;
      }

      setButtonLoading(sendResetBtn, true);

      setTimeout(() => {
        setButtonLoading(sendResetBtn, false);
        closeModal(forgotPasswordModal);
        showToast(
          'Email đã gửi',
          `Liên kết khôi phục mật khẩu đã được gửi tới ${email}. Vui lòng kiểm tra hộp thư!`,
          'success'
        );
        resetEmail.value = '';
      }, 900);
    });
  }

  // ==========================================
  // GOOGLE CLIENT ID CONFIGURATION MODAL
  // ==========================================
  if (googleConfigBtn) {
    googleConfigBtn.addEventListener('click', () => {
      const currentId = localStorage.getItem(STORAGE_KEYS.GOOGLE_CLIENT_ID) || '';
      googleClientIdInput.value = currentId;
      openModal(googleConfigModal);
    });
  }

  if (googleConfigForm) {
    googleConfigForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newId = googleClientIdInput.value.trim();
      if (newId) {
        localStorage.setItem(STORAGE_KEYS.GOOGLE_CLIENT_ID, newId);
        showToast('Đã lưu', 'Đã cập nhật Google Client ID', 'success');
        initGoogleIdentity();
      } else {
        localStorage.removeItem(STORAGE_KEYS.GOOGLE_CLIENT_ID);
        showToast('Mặc định', 'Đã chuyển về trình mô phỏng tương tác', 'info');
      }
      closeModal(googleConfigModal);
    });
  }

  if (resetGoogleConfigBtn) {
    resetGoogleConfigBtn.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEYS.GOOGLE_CLIENT_ID);
      googleClientIdInput.value = '';
      closeModal(googleConfigModal);
      showToast('Đã đặt lại', 'Đang sử dụng chế độ mô phỏng trực quan', 'info');
    });
  }

  // ==========================================
  // MODAL HELPER FUNCTIONS
  // ==========================================
  function openModal(modal) {
    if (!modal) return;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // Close modals on clicking overlay or close button
  [closeGoogleModalBtn, closeForgotModalBtn, closeConfigModalBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        closeModal(modal);
      });
    }
  });

  [googleChooserModal, forgotPasswordModal, googleConfigModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    }
  });

  // Terms & Privacy Links
  const termsLink = document.getElementById('termsLink');
  const privacyLink = document.getElementById('privacyLink');
  if (termsLink) {
    termsLink.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Điều khoản', 'Điều khoản sử dụng dịch vụ tiêu chuẩn bảo vệ dữ liệu người dùng', 'info');
    });
  }
  if (privacyLink) {
    privacyLink.addEventListener('click', (e) => {
      e.preventDefault();
      showToast('Bảo mật', 'NexusAuth cam kết mã hóa và bảo vệ an toàn thông tin cá nhân', 'info');
    });
  }

  // ==========================================
  // UI UTILITIES: SPINNERS & TOASTS
  // ==========================================
  function setButtonLoading(button, isLoading) {
    if (!button) return;
    const btnText = button.querySelector('.btn-text');
    const spinner = button.querySelector('.spinner');

    if (isLoading) {
      button.disabled = true;
      if (btnText) btnText.style.opacity = '0';
      if (spinner) spinner.classList.remove('hidden');
    } else {
      button.disabled = false;
      if (btnText) btnText.style.opacity = '1';
      if (spinner) spinner.classList.add('hidden');
    }
  }

  function showToast(title, message, type = 'info') {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      `;
    } else if (type === 'error') {
      iconSvg = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
      `;
    } else {
      iconSvg = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      `;
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 4000);
  }

  // Initialize GIS if window loaded
  window.addEventListener('load', () => {
    initGoogleIdentity();
  });
});
