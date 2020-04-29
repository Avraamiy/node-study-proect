document.querySelectorAll('.price').forEach((node) => {
    node.textContent = new Intl.NumberFormat('ru-RU', {
        currency: 'rub',
        style: 'currency'
    }).format(node.textContent)
})

 const toCurrency = price => {
    return new Intl.NumberFormat('ru-RU', {
        currency: 'rub',
        style: 'currency'
    }).format(price)
 }
let el = document.querySelectorAll('.tabs')
const instance = M.Tabs.init(el);

const $cart = document.querySelector('#cart')

if ($cart) {
    $cart.addEventListener('click', evt => {
        if (evt.target.classList.contains('js-remove')) {
            const id = evt.target.dataset.id
            const csrf = evt.target.dataset.csrf
            fetch('/cart/remove/' + id, {
                headers: {
                    'X-CSRF-TOKEN': csrf
                },
                method: 'delete'
            }).then(res => res.json())
                .then(cart => {
                    if (cart.courses.length) {
                        const html = cart.courses.map(c => {
                            return `<tr>
                    <td>${c.title}</td>
                    <td>${c.count}</td>
                    <td>${c.price}</td>

                    <td>
                        <button class="btn btm-small js-remove" data-csrf="${csrf}" data-id="${c.id}">Delete</button>
                    </td>
                    <td>
                        <button class="btn-floating btn-small waves-effect waves-light red ">
                            <i class="material-icons js-add-count" data-id="${c.id}" data-csrf="${csrf}" style="font-size: 0.8rem;">add</i></button>
                    <td/>
                </tr>`
                        }).join('')
                        document.querySelector('tbody').innerHTML = html
                        $cart.querySelector('.price').textContent = toCurrency(cart.price)
                    } else {
                        $cart.innerHTML = '<p>Cart is empty</p>'
                    }
                })
        }
        else if(evt.target.classList.contains('js-add-count')) {
            const id = evt.target.dataset.id
            const csrf = evt.target.dataset.csrf
            fetch('/cart/add/' + id, {
                headers: {
                    'X-CSRF-TOKEN': csrf
                },
                method: "put"
            }).then(res => res.json())
                .then(cart => {
                    if (cart.courses.length) {
                        const html = cart.courses.map(c => {
                            return `<tr>
                    <td>${c.title}</td>
                    <td>${c.count}</td>
                    <td>${c.price}</td>

                    <td>
                        <button class="btn btm-small js-remove" data-id="${c.id}">Delete</button>
                    </td>
                    <td>
                        <button class="btn-floating btn-small waves-effect waves-light red ">
                            <i class="material-icons js-add-count" data-id="${c.id}" style="font-size: 0.8rem;">add</i></button>
                    <td/>
                </tr>`
                        }).join('')
                        document.querySelector('tbody').innerHTML = html
                        $cart.querySelector('.price').textContent = toCurrency(cart.price)
                    } else {
                        $cart.innerHTML = '<p>Cart is empty</p>'
                    }
                })
        }
    })
}
