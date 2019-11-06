const Marriage = artifacts.require("./Marriage.sol");
const ethUtil = require('ethereumjs-util')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

contract("Marriage", accounts => {

    name = "Marriage";
    symbol = "M";
    proposer = accounts[0]
    accepter = accounts[1]
    guest_list = accounts.slice(2)
    date_time = "11/09/2020 14:00";
    unix_date_time = Date.parse(date_time);


    it("Access the marriage contract", async () => {
        contract = await Marriage.deployed()
        expect(await contract.read_symbol()).to.equal(symbol);
        expect(await contract.read_name()).to.equal(name);
    })

    it("Make a proposal", async () => {
        propose = await contract.propose(accepter, {from: proposer});
        expect(await contract.get_pending_proposal({from: proposer})).to.equal(accepter);
        expect(await contract.get_incoming_proposals({from: accepter})).to.include(proposer)
    })
    
    it("Accept proposal", async () => {
        wedding = await contract.accept(proposer, {from: accepter});
        weddingid = await contract.get_wedding_id()
        wedding_object = await contract.get_wedding_by_id(weddingid)
        console.log("Initial wedding object")
        console.log(wedding_object)
        expect(wedding_object.proposer).to.equal(proposer);
        expect(wedding_object.accepter).to.equal(accepter);
        expect(wedding_object.status).to.equal("engaged");
    })

    it("Arrange wedding", async () => {
        wedding = await contract.arrange(weddingid, unix_date_time, guest_list, {from: proposer})
        wedding_object = await contract.get_wedding_by_id(weddingid)
        console.log("Wedding object after being accepted")
        console.log(wedding_object)
        expect(wedding_object.proposer).to.equal(proposer);
        expect(wedding_object.accepter).to.equal(accepter);
        expect(wedding_object.date).to.equal(String(unix_date_time));
        for (let i = 0; i < guest_list.length; i++){
            expect(wedding_object.guest_list[i]).to.equal(guest_list[i]);
        }
        expect(wedding_object.status).to.equal("arranged");
    })

    it("Accept invitation", async () => {
        messagetoSign = web3.eth.abi.encodeParameter('uint256', String(weddingid))
        await web3.eth.personal.unlockAccount(guest_list[0], "poc@2018");
        signature = await web3.eth.sign(messagetoSign, guest_list[0]);
        ticket = await contract.accept_invitation(weddingid, signature, {from: guest_list[0]});
        weddingid_hash = ticket.logs[0].args.weddingid_hash
        ticket = ticket.logs[0].args.ticket
        console.log("ticket: ", ticket)
        console.log("weddingid hash: ", weddingid_hash)
    })

    it("Show ticket", async () => {
        signatureData = ethUtil.fromRpcSig(signature);
        v = ethUtil.bufferToHex(signatureData.v);
        r = ethUtil.bufferToHex(signatureData.r);
        s = ethUtil.bufferToHex(signatureData.s);
        //console.log(guest_list[0])
        //console.log(messagetoSign)
        console.log("ticket: ", signature)
        //console.log(signatureData)
        rea = await web3.eth.accounts.recover(messagetoSign, v, r, s)
        console.log("The result of running recover() on the ticket: ", rea)
        console.log("The actual signer of the ticket: ", guest_list[0])
        expect(rea).to.equal(guest_list[0])
    })

    it("Call for objection", async () => {
        call = await contract.call_for_objection()
        objection_time = call.logs[0].args.objection_time
        console.log(objection_time)
    })

    /*it("Object", async () => {
        await contract.object(weddingid, {from: guest_list[0]})
        wedding_object = await contract.get_wedding_by_id(weddingid)
        console.log("Wedding failed")
        console.log(wedding_object)    })*/

    it("Seal the deal", async () => {
        await sleep(11000)
        deal = await contract.seal_the_deal({from: proposer})
        wedding_object = await contract.get_wedding_by_id(weddingid)
        console.log("Wedding complete")
        console.log(wedding_object)
    })
})