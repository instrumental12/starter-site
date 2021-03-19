pragma solidity ^0.6.0;

contract Payment {
    address payable public owner;
    constructor() public payable {
        owner = msg.sender;
    }

    modifier onlyOwner {
        
    }

    function withdraw() public payable returns(bool) {

    }
}