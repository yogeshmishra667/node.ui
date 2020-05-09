const deleteProduct = (btn) => {
  const productId = btn.parentNode.querySelector('[name=productId').value;
  const csrf = btn.parentNode.querySelector('[name=_csrf').value;

  const productEl = btn.closest('article');

  fetch(`/admin/product/${productId}`, { 
    method: 'DELETE', 
    headers: { 'csrf-token': csrf } 
  })
    .then(result => result.json())
    .then(data => {
      if (data.message === 'Success') {
        productEl.remove();
      } else {
        alert(message);
      }
    })
    .catch(error => alert(error));
};