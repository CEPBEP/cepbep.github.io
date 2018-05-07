#include <utility>
#include <iostream>

#include "Block.h"
#include "sha256.h"

Block::Block(std::string data, std::string previous_hash)
{
    this->data = std::move(data);
    this->previous_hash = std::move(previous_hash);
    this->timestamp = time(0);
    this->hash = calculate_hash();
}

std::string Block::calculate_hash()
{
    return sha256(previous_hash + ctime(&timestamp) + std::to_string(nonce) + data);
}

void Block::mine_block(unsigned long difficulty)
{
    std::string target(new char[difficulty]);
    target.replace(target.begin(), target.end(), '\0', '0');

    while (hash.substr(0, difficulty) != target)
    {
        nonce++;
        hash = calculate_hash();
    }

    std::cout << " + БЛОК : " << hash << std::endl;
}

std::string Block::get_hash()
{
    return hash;
}

std::string Block::get_previous_hash()
{
    return previous_hash;
}
