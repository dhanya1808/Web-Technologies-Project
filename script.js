// header dropdown start 
const elham=document.getElementById('ham');
const elhead=document.querySelector("header");
const eloverlay=document.querySelector(".overlay");
const elsfade=document.querySelectorAll(".has-fade");
const body=document.querySelector("body");

elham.onclick=function(){
    console.log("Click hamburger");
    if(elhead.classList.contains('open')){
        body.classList.remove("noscroll");
        elhead.classList.remove('open');
        elsfade.forEach(function(element){
            element.classList.remove('fade-in');
            element.classList.add('fade-out');
        });
    }
    else{
        body.classList.add("noscroll");
        elhead.classList.add('open');
        
        elsfade.forEach(function(element){
            element.classList.remove("fade-out");
            element.classList.add("fade-in");
        });    
    }
};
// header dropdown end 
// shopping cart start 
//variables start
const cartBtn = document.querySelector(".bag");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const payBtn = document.querySelector(".pay-btn");
const cartDOM = document.querySelector(".shopping-cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
//variabls end


//cart
let cart = [];
//buttons
let buttonsDOM = [];
//getting products
class Products{
    async getProducts(){
        try{
            let result = await fetch("products.json");
            let data = await result.json();
            let products = data.items;
            products = products.map(item => {
                const {title , price} = item.fields;
                const {id} = item.sys; 
                const image = item.fields.image.fields.file.url
                return {title, price, id ,image};
            });
            return products;
        }
        catch(error){
            console.log(error);
        }
    }
}
//display products
class UI{
    displayProducts(products){
        let result = "";
        products.forEach(product => {
            result += `
            <article class="product">
              <div class="img-container">
                <img src=${product.image} alt=${product.title} class="product-img">
                <button class="bag-btn" data-id= ${product.id}>
                    <i class="fa fa-shopping-bag" aria-hidden="true"></i>
                    Add to cart
                </button>
                <h3>${product.title}</h3>
                <h4>&#8377;${product.price}</h4>
              </div>
            </article>
            `;
        });
        productsDOM.innerHTML = result;
    }
    getBagBtns(){
        const buttons = Array.from(document.querySelectorAll(".bag-btn"));
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if(inCart){
                button.innerText = "In cart";
                button.disabled = true;
            }
        
            button.addEventListener("click",(event) =>{
                event.target.innerText = "In cart";
                event.target.disabled = true;
                //get product from products
                let cartItem = {...Storage.getProduct(id), amount : 1};
                //add product to the cart
                cart = [...cart, cartItem];
                //save cart in local storage
                Storage.saveCart(cart);
                //set cart values
                this.setCartValues(cart);
                //display cart items
                this.addCartItem(cartItem);
                //show the cart
                this.showCart();

            });
        });
    }
    setCartValues(cart){
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
        
    }
    addCartItem(item){
        const div = document.createElement("div");
        div.classList.add("cart-item");
        div.innerHTML = `
            <img src=${item.image} alt=${item.title}>
            <div>
                <h4>${item.title}</h4>
                <h5>&#8377;${item.price}</h5>
                <span class="remove-item" data-id=${item.id}>Remove item</span>
            </div>
            <div>
                <i class="fa fa-chevron-up" data-id=${item.id}></i>
                <p class="item-amount">${item.amount}</p>
                <i class="fa fa-chevron-down" data-id=${item.id}></i>
            </div>
        `;
        cartContent.appendChild(div);
    }
    showCart(){
        cartOverlay.classList.add("transparentBcg");
        cartDOM.classList.add("showCart");
        if(parseInt(cartItems.innerText) == 0){
            clearCartBtn.classList.add("hideCartBtn");
            payBtn.classList.add("hideCartBtn")
        }
        else{
            clearCartBtn.classList.remove("hideCartBtn");
            payBtn.classList.remove("hideCartBtn")

        }
    }
    setupAPP(){
        cart =Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener("click", this.showCart);
        closeCartBtn.addEventListener("click", this.hideCart);
        
    }
    populateCart(cart){
        cart.forEach(item =>this.addCartItem(item));
    }
    hideCart(){
        cartOverlay.classList.remove("transparentBcg");
        cartDOM.classList.remove("showCart");
    }
    cartLogic(){
        //clear cart button
        clearCartBtn.addEventListener("click", () => {
            this.clearCart();
        });
        //cart functionality
        cartContent.addEventListener("click", event =>{
            if(event.target.classList.contains("remove-item")){
                let removeItem = event.target;
                let id=removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }
            else if(event.target.classList.contains("fa-chevron-up")){
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount += 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }
            else if(event.target.classList.contains("fa-chevron-down")){
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount -= 1;
                if(tempItem.amount > 0){
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                }
                else{
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        });
    }
    clearCart(){
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while(cartContent.children.length>0){
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    }
    removeItem(id){
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `
            <i class="fa fa-shopping-bag" aria-hidden="true"></i>
            Add to cart
        `;
    }
    getSingleButton(id){
        return buttonsDOM.find(button => button.dataset.id === id);
    }
}
//local storage
class Storage{
    static saveProducts(products){
        localStorage.setItem("products", JSON.stringify(products));
    }
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem("products"));
        return products.find(product => product.id === id)
    }
    static saveCart(cart){
        localStorage.setItem("cart",JSON.stringify(cart));
    }
    static getCart(){
        return localStorage.getItem("cart")?JSON.parse(localStorage.getItem("cart")):[];
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const ui= new UI();
    const products = new Products();
    //setup app
    ui.setupAPP();
    
    
    //get all products
    products.getProducts().then(products => {
        ui.displayProducts(products)
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagBtns();
        ui.cartLogic();
    });
});
// shopping cart end 

      //login signup form start
      const loginText = document.querySelector(".title-text .login");
      const loginForm = document.querySelector("form.login");
      const signupLink = document.querySelector("form .signup-link a");
      const loginBtn = document.querySelector("label.login");
      const signupBtn = document.querySelector("label.signup");

      signupBtn.onclick = (()=>{
      loginForm.style.marginLeft = "-50%";
      loginText.style.marginLeft = "-50%";
      });
      loginBtn.onclick = (()=>{
      loginForm.style.marginLeft = "0%";
      loginText.style.marginLeft = "0%";
      });
      signupLink.onclick = (()=>{
      signupBtn.click();
      return false;
      });