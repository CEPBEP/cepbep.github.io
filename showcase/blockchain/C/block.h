#pragma once
#include <string>
#include <utility>
#include <ctime>

class Block
{
private:
    std::string hash;
    std::string previous_hash;
    std::string data;
    time_t timestamp;
    int nonce;
public:
    Block(std::string data, std::string previous_hash);

    std::string calculate_hash();

    void mine_block(unsigned long difficulty);

    std::string get_hash();
    std::string get_previous_hash();
};
