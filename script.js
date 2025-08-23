// ===== Cached Selectors =====
const menuBtn = document.querySelector('#menu-btn');
const navbar = document.querySelector('.navbar');
const header = document.querySelector('.header');
const sliderImages = document.querySelectorAll('.image-slider img');
const mainHomeImage = document.querySelector('.main-home-image');

// ===== Navbar Toggle =====
menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('fa-times');
    navbar.classList.toggle('active');
});

// ===== Close Navbar + Sticky Header on Scroll =====
window.addEventListener('scroll', () => {
    menuBtn.classList.remove('fa-times');
    navbar.classList.remove('active');

    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    // Highlight active nav link
    document.querySelectorAll('section').forEach(sec => {
        let top = window.scrollY;
        let offset = sec.offsetTop - 150;
        let height = sec.offsetHeight;
        let id = sec.getAttribute('id');

        if (top >= offset && top < offset + height) {
            document.querySelectorAll('.navbar a').forEach(link => {
                link.classList.remove('active');
                document.querySelector(`.navbar a[href*=${id}]`).classList.add('active');
            });
        }
    });
});

// ===== Image Slider Preview =====
sliderImages.forEach(img => {
    img.addEventListener('click', () => {
        const src = img.getAttribute('src');
        mainHomeImage.src = src;

        // Add fade animation
        mainHomeImage.classList.add('fade-change');
        setTimeout(() => mainHomeImage.classList.remove('fade-change'), 500);
    });
});

// ===== SwiperJS (Reviews Slider) =====
const swiper = new Swiper(".review-slider", {
    spaceBetween: 20,
    loop: true,
    grabCursor: true,
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    breakpoints: {
        0: { slidesPerView: 1 },
        768: { slidesPerView: 2 }
    }
});

// ===== Scroll Animations (Fade-in-Up) =====
const revealElements = document.querySelectorAll('.fade-in-up');

const revealOnScroll = () => {
    revealElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
            el.classList.add('visible');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// ===== Dark Mode Toggle (Bonus) =====
const darkToggle = document.querySelector('#dark-toggle'); 
if (darkToggle) {
    darkToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        darkToggle.classList.toggle('active');
    });
}
const addToCartButtons = document.querySelectorAll(".add-to-cart");

addToCartButtons.forEach(button => {
    button.addEventListener("click", e => {
        const box = e.target.closest(".box");
        const name = box.querySelector("h3").innerText;
        const price = parseFloat(box.querySelector("span").innerText.replace("$", ""));

        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        cart.push({ name, price });
        localStorage.setItem("cart", JSON.stringify(cart));

        alert(`${name} added to cart`);

        // Redirect to cart page
        window.location.href = "cart.html";
    });
});