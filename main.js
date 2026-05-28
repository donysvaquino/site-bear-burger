
document.addEventListener('DOMContentLoaded', () => {
  // Video Scroll Logic
  const video = document.getElementById('hero-video');
  const heroWrapper = document.querySelector('.hero-wrapper');

  if (video && heroWrapper) {
    let hasLoaded = false;

    // Assegura que o vídeo inicie pausado
    video.pause();

    video.addEventListener('loadedmetadata', () => {
      hasLoaded = true;
    });

    // Fallback caso o evento não dispare a tempo
    setTimeout(() => { hasLoaded = true; }, 1000);

    let rafId;
    window.addEventListener('scroll', () => {
      if (!hasLoaded) return;

      if (rafId) cancelAnimationFrame(rafId);

      rafId = requestAnimationFrame(() => {
        const wrapperRect = heroWrapper.getBoundingClientRect();
        const start = wrapperRect.top;
        const totalScroll = wrapperRect.height - window.innerHeight;

        // Calcula o progresso do scroll no wrapper de 0 a 1
        let progress = -start / totalScroll;
        progress = Math.max(0, Math.min(1, progress));

        // Mapeia o progresso para a duração do vídeo
        if (video.duration) {
          const targetTime = progress * video.duration;

          // Suaviza a troca de tempo para evitar pulos grandes constantes
          if (Math.abs(video.currentTime - targetTime) > 0.05) {
            video.currentTime = targetTime;
          }
        }
      });
    });
  }

  // Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const navMenu = document.querySelector('.nav-desktop');

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navMenu.classList.toggle('active');

      // Prevent scrolling when menu is open
      if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  // Close mobile menu when clicking a link
  const navLinks = document.querySelectorAll('.nav-link, .btn-primary');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('active')) {
        mobileToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // Header Scroll Effect
  const header = document.querySelector('.header');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Scroll Reveal Animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, observerOptions);

  const revealElements = document.querySelectorAll('.card, .section-title, .about-text');

  revealElements.forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });

  // Carousel Logic
  const track = document.querySelector('.carousel-track');
  const prevBtn = document.querySelector('.carousel-btn.prev');
  const nextBtn = document.querySelector('.carousel-btn.next');

  if (track && prevBtn && nextBtn) {
    prevBtn.addEventListener('click', () => {
      const cardWidth = track.querySelector('.review-card').offsetWidth + 30; // 30 is the gap
      track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      const cardWidth = track.querySelector('.review-card').offsetWidth + 30;
      track.scrollBy({ left: cardWidth, behavior: 'smooth' });
    });
  }
});


document.addEventListener('DOMContentLoaded', () => {
  // --- Cart State ---
  let cart = [];

  // --- DOM Elements ---
  const cartToggleBtn = document.getElementById('cart-toggle');
  const cartSidebar = document.getElementById('cart-sidebar');
  const closeCartBtn = document.getElementById('close-cart');
  const cartOverlay = document.getElementById('cart-overlay');
  const cartBadge = document.getElementById('cart-badge');
  const cartItemsContainer = document.getElementById('cart-items');
  const checkoutBtn = document.getElementById('checkout-btn');
  const checkoutModal = document.getElementById('checkout-modal');
  const closeCheckoutModal = document.getElementById('close-checkout-modal');
  const checkoutForm = document.getElementById('checkout-form');
  const addButtons = document.querySelectorAll('.btn-add-cart');

  // --- Functions ---
  const toggleCart = () => {
    cartSidebar.classList.toggle('active');
    cartOverlay.classList.toggle('active');
  };

  if (cartToggleBtn) cartToggleBtn.addEventListener('click', toggleCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
  if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

  const updateCartUI = () => {
    // Update badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;

    // Update items list
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = '<p class="empty-cart">Sua cesta está vazia.</p>';
      checkoutBtn.disabled = true;
      return;
    }

    checkoutBtn.disabled = false;
    cartItemsContainer.innerHTML = '';

    cart.forEach((item, index) => {
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <span class="text-muted">Quantidade: ${item.quantity}</span>
        </div>
        <div class="cart-item-controls">
          <button class="cart-item-btn btn-minus" data-index="${index}">-</button>
          <span>${item.quantity}</span>
          <button class="cart-item-btn btn-plus" data-index="${index}">+</button>
        </div>
      `;
      cartItemsContainer.appendChild(itemEl);
    });

    // Add event listeners to + and - buttons
    document.querySelectorAll('.btn-minus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = e.target.getAttribute('data-index');
        if (cart[index].quantity > 1) {
          cart[index].quantity--;
        } else {
          cart.splice(index, 1);
        }
        updateCartUI();
      });
    });

    document.querySelectorAll('.btn-plus').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = e.target.getAttribute('data-index');
        cart[index].quantity++;
        updateCartUI();
      });
    });
  };

  // --- Toast System ---
  const showToast = (message) => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      if (container.contains(toast)) container.removeChild(toast);
    }, 2300);
  };

  // --- Add to Cart Event ---
  addButtons.forEach(btn => {
    // Clone to remove old listeners just in case
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    newBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent modal opening if clicking button directly
      const name = e.target.getAttribute('data-name');

      const existingItem = cart.find(item => item.name === name);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        cart.push({ name, quantity: 1 });
      }

      showToast(name + ' adicionado!');
      updateCartUI();
    });
  });

  // --- Modal Logic ---
  const modal = document.getElementById('product-modal');
  const closeModal = document.getElementById('close-product-modal');
  const cards = document.querySelectorAll('.menu-item.card');

  let currentModalProduct = '';
  let currentModalQty = 1;

  if (modal) {
    cards.forEach(card => {
      card.addEventListener('click', () => {
        // Apenas abre o modal no mobile
        if (window.innerWidth > 768) return;

        const name = card.querySelector('.item-name').textContent;
        const desc = card.querySelector('.item-desc').textContent;
        const img = card.querySelector('.menu-item-image').src;

        document.getElementById('modal-product-img').src = img;
        document.getElementById('modal-product-title').textContent = name;
        document.getElementById('modal-product-desc').textContent = desc;

        currentModalProduct = name;
        currentModalQty = 1;
        document.getElementById('modal-quantity').textContent = currentModalQty;

        modal.classList.add('active');
      });
    });

    closeModal.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('active');
    });

    document.getElementById('modal-btn-minus').addEventListener('click', () => {
      if (currentModalQty > 1) {
        currentModalQty--;
        document.getElementById('modal-quantity').textContent = currentModalQty;
      }
    });

    document.getElementById('modal-btn-plus').addEventListener('click', () => {
      currentModalQty++;
      document.getElementById('modal-quantity').textContent = currentModalQty;
    });

    document.getElementById('modal-btn-add').addEventListener('click', () => {
      const existingItem = cart.find(item => item.name === currentModalProduct);
      if (existingItem) existingItem.quantity += currentModalQty;
      else cart.push({ name: currentModalProduct, quantity: currentModalQty });

      showToast(currentModalProduct + ' adicionado!');
      updateCartUI();
      modal.classList.remove('active');
    });
  }

  // --- Checkout / WhatsApp Logic ---
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) return;
      
      if (checkoutModal) {
        checkoutModal.classList.add('active');
      }
    });
  }

  if (closeCheckoutModal) {
    closeCheckoutModal.addEventListener('click', () => checkoutModal.classList.remove('active'));
  }
  
  if (checkoutModal) {
    checkoutModal.addEventListener('click', (e) => {
      if (e.target === checkoutModal) checkoutModal.classList.remove('active');
    });
  }

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (cart.length === 0) return;

      const bairro = document.getElementById('checkout-bairro').value.trim();
      const rua = document.getElementById('checkout-rua').value.trim();
      const complemento = document.getElementById('checkout-complemento').value.trim();
      const obs = document.getElementById('checkout-obs').value.trim();

      const hour = new Date().getHours();
      let greeting = 'Boa noite';
      if (hour >= 5 && hour < 12) greeting = 'Bom dia';
      else if (hour >= 12 && hour < 18) greeting = 'Boa tarde';

      let message = `Olá, ${greeting}! Gostaria de fazer o seguinte pedido:\n\n`;

      cart.forEach(item => {
        message += `- ${item.quantity}x ${item.name}\n`;
      });

      if (obs) {
        message += `\n*Observações:*\n${obs}\n`;
      }

      if (bairro || rua || complemento) {
        message += `\n*Endereço de Entrega:*\n`;
        if (bairro) message += `Bairro: ${bairro}\n`;
        if (rua) message += `Rua: ${rua}\n`;
        if (complemento) message += `Complemento: ${complemento}\n`;
      }

      message += `\nAguardo as instruções para envio e pagamento.`;

      const whatsappUrl = `https://wa.me/5511911212687?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      checkoutModal.classList.remove('active');
    });
  }

  // --- Dynamic WhatsApp Buttons ---
  const dynamicWaBtns = document.querySelectorAll('.btn-whatsapp-dynamic');
  dynamicWaBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const hour = new Date().getHours();
      let greeting = 'Boa noite';
      if (hour >= 5 && hour < 12) greeting = 'Bom dia';
      else if (hour >= 12 && hour < 18) greeting = 'Boa tarde';
      
      const message = `Olá, ${greeting}! Gostaria de fazer um pedido.`;
      const whatsappUrl = `https://wa.me/5511911212687?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    });
  });
});
