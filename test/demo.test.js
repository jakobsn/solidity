const Marriage = artifacts.require("./Marriage.sol");
const ethUtil = require('ethereumjs-util')

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
        console.log(wedding_object)
        expect(wedding_object.proposer).to.equal(proposer);
        expect(wedding_object.accepter).to.equal(accepter);
        expect(wedding_object.status).to.equal("engaged");
    })

    it("Arrange wedding", async () => {
        wedding = await contract.arrange(weddingid, unix_date_time, guest_list, {from: proposer})
        wedding_object = await contract.get_wedding_by_id(weddingid)
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
        console.log(ticket)
        console.log(weddingid_hash)
    })

    it("Show ticket", async () => {
        /*signature = '0xc74598c872fd0bc07644c90bd601ea29b647fc31383e1896805db2508b0e118a15d2d06c931985329db649aa10305af5415557c89d9f361f58cf833566132c151c'
        signature = signature.substr(0, 130) + (signature.substr(130) == "00" ? "1b" : "1c");
        console.log(signature)
        show_ticket = await contract.show_ticket('0x1c', '0xc74598c872fd0bc07644c90bd601ea29b647fc31383e1896805db2508b0e118a', '0x15d2d06c931985329db649aa10305af5415557c89d9f361f58cf833566132c15', weddingid)
        console.log(show_ticket)
        guest = show_ticket.logs[0].args.guest
        wedding_id = show_ticket.logs[0].args.wedding_id
        weddingid_hash = show_ticket.logs[0].args.weddingid_hash
        console.log(wedding_id, weddingid_hash, guest)
        expect(guest).to.equal(guest_list[0])*/



        signatureData = ethUtil.fromRpcSig(signature);
        v = ethUtil.bufferToHex(signatureData.v);
        r = ethUtil.bufferToHex(signatureData.r);
        s = ethUtil.bufferToHex(signatureData.s);
        console.log(guest_list[0])
        console.log(messagetoSign)
        console.log(signature)
        console.log(signatureData)
        rea = await web3.eth.accounts.recover(messagetoSign, v, r, s)
        console.log(rea)
        expect(rea).to.equal(guest_list[0])
    })

})