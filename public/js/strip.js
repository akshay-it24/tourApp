
const stripe = Stripe('pk_test_51IRv3EJUYMHHOLOsYdyTZwfSCue0bnAzGQzg12w0dhtFGi5zW5owFwVRvbY2rWp9cVVhm8pAsyoKKnes46xoCnDF00HKP62se6');
const bookBtn = document.getElementById('book-tour');

const bookTour = async tourId => {
    try {
        console.log("akshay");
        const session = await axios(
            `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
        );
        console.log(session);

        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    } catch (err) {
        console.log(err);
        showAlert('error', err);
    }
}


if (bookBtn) {
    bookBtn.addEventListener('click', e => {
        e.target.textContent = 'Processing...';
        const { tourId } = e.target.dataset;
        bookTour(tourId);
    })
}