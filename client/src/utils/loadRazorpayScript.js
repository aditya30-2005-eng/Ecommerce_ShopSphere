// Dynamically loads the Razorpay Checkout script exactly once and resolves
// true/false depending on whether it loaded successfully. Keeping this out
// of index.html means pages that never checkout don't pay the network cost.
let loadingPromise = null;

export const loadRazorpayScript = () => {
  if (window.Razorpay) return Promise.resolve(true);
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  return loadingPromise;
};
