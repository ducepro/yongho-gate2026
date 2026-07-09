document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageIndicator = document.getElementById('page-indicator');
    
    let currentSlideIndex = 0;

    function updateSlides() {
        slides.forEach((slide, index) => {
            if (index === currentSlideIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
        pageIndicator.textContent = `${currentSlideIndex + 1} / ${slides.length}`;
    }

    prevBtn.addEventListener('click', () => {
        if (currentSlideIndex > 0) {
            currentSlideIndex--;
            updateSlides();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentSlideIndex < slides.length - 1) {
            currentSlideIndex++;
            updateSlides();
        }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ') {
            if (currentSlideIndex < slides.length - 1) {
                currentSlideIndex++;
                updateSlides();
            }
        } else if (e.key === 'ArrowLeft') {
            if (currentSlideIndex > 0) {
                currentSlideIndex--;
                updateSlides();
            }
        }
    });

    // Initialize
    updateSlides();
});
