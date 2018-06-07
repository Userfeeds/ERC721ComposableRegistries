const web3Abi = require('web3-eth-abi');
const keccak = require('js-sha3').keccak_256;

const ERC721ComposableRegistry = artifacts.require("ERC721ComposableRegistry.sol");
const SampleERC721 = artifacts.require("SampleERC721.sol");

contract('ERC721ComposableRegistry', (accounts) => {

    beforeEach(async () => {
        this.registry = await ERC721ComposableRegistry.new();
        this.erc721 = await SampleERC721.new();
        await this.erc721.create();
        await this.erc721.create();
        await this.erc721.create();
        await this.erc721.create();
        await this.erc721.setApprovalForAll(this.registry.address, true);
    });

    it("Transfer event is emitted after transfer to token", async () => {
        const r = await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        assert.equal(r.logs.length, 1);
        assert.equal(r.logs[0].event, 'ERC721Transfer');
        const args = r.logs[0].args;
        assert.equal(args.from, accounts[0]);
        assert.equal(args.toErc721, this.erc721.address);
        assert.equal(args.toTokenId, 1);
        assert.equal(args.whichErc721, this.erc721.address);
        assert.equal(args.whichTokenId, 2);
    });

    it("Transfer event is emitted after transfer from token to token", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        const r = await this.registry.transfer(this.erc721.address, 3, this.erc721.address, 2);
        assert.equal(r.logs.length, 1);
        assert.equal(r.logs[0].event, 'ERC721Transfer');
        const args = r.logs[0].args;
        assert.equal(args.fromErc721, this.erc721.address);
        assert.equal(args.fromTokenId, 1);
        assert.equal(args.toErc721, this.erc721.address);
        assert.equal(args.toTokenId, 3);
        assert.equal(args.whichErc721, this.erc721.address);
        assert.equal(args.whichTokenId, 2);
    });

    it("Transfer event is emitted after transfer to address", async () => {
        await this.registry.transfer(this.erc721.address, 1, this.erc721.address, 2);
        const r = await this.registry.transferToAddress(accounts[1], this.erc721.address, 2);
        assert.equal(r.logs.length, 1);
        assert.equal(r.logs[0].event, 'ERC721Transfer');
        const args = r.logs[0].args;
        assert.equal(args.fromErc721, this.erc721.address);
        assert.equal(args.fromTokenId, 1);
        assert.equal(args.to, accounts[1]);
        assert.equal(args.whichErc721, this.erc721.address);
        assert.equal(args.whichTokenId, 2);
    });

    it("Transfer events are emitted after multi transfer to token", async () => {
        const r = await this.registry.multiTransfer(this.erc721.address, 1, [this.erc721.address, this.erc721.address], [2, 3]);
        assert.equal(r.logs.length, 2);
        assert.equal(r.logs[0].event, 'ERC721Transfer');
        const args1 = r.logs[0].args;
        assert.equal(args1.from, accounts[0]);
        assert.equal(args1.toErc721, this.erc721.address);
        assert.equal(args1.toTokenId, 1);
        assert.equal(args1.whichErc721, this.erc721.address);
        assert.equal(args1.whichTokenId, 2);
        assert.equal(r.logs[1].event, 'ERC721Transfer');
        const args2 = r.logs[1].args;
        assert.equal(args2.from, accounts[0]);
        assert.equal(args2.toErc721, this.erc721.address);
        assert.equal(args2.toTokenId, 1);
        assert.equal(args2.whichErc721, this.erc721.address);
        assert.equal(args2.whichTokenId, 3);
    });

    it("Transfer events are emitted after multi transfer from token to token", async () => {
        await this.registry.multiTransfer(this.erc721.address, 1, [this.erc721.address, this.erc721.address], [2, 3]);
        const r = await this.registry.multiTransfer(this.erc721.address, 4, [this.erc721.address, this.erc721.address], [3, 2]);
        assert.equal(r.logs.length, 2);
        assert.equal(r.logs[0].event, 'ERC721Transfer');
        const args1 = r.logs[0].args;
        assert.equal(args1.fromErc721, this.erc721.address);
        assert.equal(args1.fromTokenId, 1);
        assert.equal(args1.toErc721, this.erc721.address);
        assert.equal(args1.toTokenId, 4);
        assert.equal(args1.whichErc721, this.erc721.address);
        assert.equal(args1.whichTokenId, 3);
        assert.equal(r.logs[1].event, 'ERC721Transfer');
        const args2 = r.logs[1].args;
        assert.equal(args2.fromErc721, this.erc721.address);
        assert.equal(args2.fromTokenId, 1);
        assert.equal(args2.toErc721, this.erc721.address);
        assert.equal(args2.toTokenId, 4);
        assert.equal(args2.whichErc721, this.erc721.address);
        assert.equal(args2.whichTokenId, 2);
    });

    it("Transfer events are emitted after multi transfer to address", async () => {
        await this.registry.multiTransfer(this.erc721.address, 1, [this.erc721.address, this.erc721.address], [2, 3]);
        const r = await this.registry.multiTransferToAddress(accounts[1], [this.erc721.address, this.erc721.address], [2, 3]);
        assert.equal(r.logs.length, 2);
        assert.equal(r.logs[0].event, 'ERC721Transfer');
        const args1 = r.logs[0].args;
        assert.equal(args1.fromErc721, this.erc721.address);
        assert.equal(args1.fromTokenId, 1);
        assert.equal(args1.to, accounts[1]);
        assert.equal(args1.whichErc721, this.erc721.address);
        assert.equal(args1.whichTokenId, 2);
        assert.equal(r.logs[1].event, 'ERC721Transfer');
        const args2 = r.logs[1].args;
        assert.equal(args2.fromErc721, this.erc721.address);
        assert.equal(args2.fromTokenId, 1);
        assert.equal(args2.to, accounts[1]);
        assert.equal(args2.whichErc721, this.erc721.address);
        assert.equal(args2.whichTokenId, 3);
    });

    it("Transfer event is emitted after safe transfer", async () => {
        const r = safeTransferFrom(accounts[0], this.registry.address, this.erc721.address, 1, this.erc721.address, 2);
        assert.equal(r.logs.length, 2);
        const l = r.logs[1];
        assert.equal(l.topics.length, 1);
        assert.equal(l.topics[0], '0x' + keccak('ERC721Transfer(address,address,uint256,address,uint256)'));
        assert.equal(addressAtIndex(l.data, 0), accounts[0]);
        assert.equal(addressAtIndex(l.data, 1), this.erc721.address);
        assert.equal(intAtIndex(l.data, 2), 1);
        assert.equal(addressAtIndex(l.data, 3), this.erc721.address);
        assert.equal(intAtIndex(l.data, 4), 2);
    });
});

function safeTransferFrom(from, registryAddress, toErc721, toTokenId, whichErc721, whichTokenId) {
    const to = formatToByteArray(toErc721, toTokenId);
    return safeTransferFromImpl(from, registryAddress, to, whichErc721, whichTokenId);
}

function safeTransferFromImpl(from, registryAddress, to, whichErc721, whichTokenId) {
    const safeTransferFromFunc = SampleERC721.abi.find(f => f.name === 'safeTransferFrom' && f.inputs.length === 4);
    const transferMethodTransactionData = web3Abi.encodeFunctionCall(
        safeTransferFromFunc, [from, registryAddress, whichTokenId, to]
    );
    const txHash = web3.eth.sendTransaction({
        from, to: whichErc721, data: transferMethodTransactionData, value: 0, gas: 500000
    });
    return web3.eth.getTransactionReceipt(txHash);
}

function formatToByteArray(toErc721, toTokenId) {
    return '0x' + toErc721.substring(2).padStart(64, '0') + toTokenId.toString().padStart(64, '0');
}

function addressAtIndex(data, index) {
    return '0x' + data.substring(2 + 64 * index + 24, 2 + 64 * (index + 1));
}

function intAtIndex(data, index) {
    return parseInt(data.substring(2 + 64 * index, 2 + 64 * (index + 1)), 16);
}
