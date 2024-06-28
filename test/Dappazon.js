const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.parseUnits(n.toString(), "ether");
}

describe("Dappazon", function () {
  const ID = 1;
  const NAME = "Shoes";
  const CATEGORY = "Clothing";
  const IMAGE = "IMAGE";
  const COST = tokens(1);
  const RATING = 4;
  const STOCK = 10;

  let dappazon, deployer, buyer;
  beforeEach(async function () {
    [deployer, buyer] = await ethers.getSigners();
    const Dappazon = await ethers.getContractFactory("Dappazon");
    dappazon = await Dappazon.deploy();
  });

  describe("owner", function () {
    it("Has owner", async function () {
      expect(await dappazon.owner()).to.equal(deployer.address);
    });
  });

  describe("Listing products", function () {
    let transaction;
    beforeEach(async function () {
      transaction = await dappazon.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
      await transaction.wait();
    });
    it("Should list a product", async function () {
      const listedProduct = await dappazon.items(ID);
      expect(listedProduct.name).to.equal(NAME);
      expect(listedProduct.category).to.equal(CATEGORY);
      expect(listedProduct.image).to.equal(IMAGE);
      expect(listedProduct.cost).to.equal(COST);
      expect(listedProduct.rating).to.equal(RATING);
      expect(listedProduct.stock).to.equal(STOCK);
    });
    it("Should emit event when product is listed", async function () {
      await expect(transaction).to.emit(dappazon, "List");
    });
    it("Should not list a product if not owner", async function () {
      await expect(
        dappazon.connect(buyer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK)
      ).to.be.revertedWith("Only owner can call this function!!");
    });
  });

  describe("Purchasing products", function () {
    let transaction;
    beforeEach(async function () {
      transaction = await dappazon.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
      await transaction.wait();
      transaction = await dappazon.connect(buyer).buy(ID, { value: COST });
      await transaction.wait();
    });

    it("Should purchase a product", async function () {
      const purchasedProduct = await dappazon.items(ID);
      expect(purchasedProduct.stock).to.equal(STOCK - 1);
    });

    it("Updates contract balance", async function () {
      const balance = await ethers.provider.getBalance(dappazon);
      expect(balance).to.equal(COST);
    });

    it("Updates buyers order count", async function () {
      const orderCount = await dappazon.orderCount(buyer.address);
      expect(orderCount).to.equal(1);
    });

    it("Adds the order", async function () {
      const order = await dappazon.orders(buyer.address, 1);
      expect(order.time).to.be.greaterThan(0);
      expect(order.item.name).to.equal(NAME);
    });

    it("Should emit event when product is purchased", async function () {
      await expect(transaction).to.emit(dappazon, "Buy");
    });
  });


  describe("Withdrawing", () => {
    let balanceBefore

    beforeEach(async () => {
      // List a item
      let transaction = await dappazon.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK)
      await transaction.wait()

      // Buy a item
      transaction = await dappazon.connect(buyer).buy(ID, { value: COST })
      await transaction.wait()

      // Get Deployer balance before
      balanceBefore = await ethers.provider.getBalance(deployer)

      // Withdraw
      transaction = await dappazon.connect(deployer).withdraw()
      await transaction.wait()
    })

    it('Updates the owner balance', async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer)
      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    })

    it('Updates the contract balance', async () => {
      const result = await ethers.provider.getBalance(dappazon)
      expect(result).to.equal(0)
    })
  })
});
