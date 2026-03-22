// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MeloDash
 * @notice Pagamento simples para plataforma/ artista com split fixo
 * @dev Rede Monad (EVM compatible)
 */
contract MeloDash {
    error NotOwner();
    error InsufficientPayment();
    error ZeroAddress();
    error TransferFailed();

    address public owner;
    address public immutable platformWallet;
    address public immutable artistWallet;
    uint256 public subscriptionPrice;

    event Payment(address indexed payer, address indexed userWallet, uint256 amount, uint256 artistShare, uint256 platformShare, uint256 userShare);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(
        uint256 _subscriptionPrice,
        address _platformWallet,
        address _artistWallet
    ) {
        if (_subscriptionPrice == 0) revert InsufficientPayment();
        if (_platformWallet == address(0) || _artistWallet == address(0)) revert ZeroAddress();

        owner = msg.sender;
        subscriptionPrice = _subscriptionPrice;
        platformWallet = _platformWallet;
        artistWallet = _artistWallet;
    }

    function updateSubscriptionPrice(uint256 newPrice) external onlyOwner {
        if (newPrice == 0) revert InsufficientPayment();
        subscriptionPrice = newPrice;
    }

    function pay(address userWallet) external payable {
        if (msg.value < subscriptionPrice) revert InsufficientPayment();
        if (userWallet == address(0)) revert ZeroAddress();

        uint256 artistShare = (msg.value * 6000) / 10000; // 60%
        uint256 platformShare = (msg.value * 3000) / 10000; // 30%
        uint256 userShare = msg.value - artistShare - platformShare; // 10%

        _send(artistWallet, artistShare);
        _send(platformWallet, platformShare);
        _send(userWallet, userShare);

        emit Payment(msg.sender, userWallet, msg.value, artistShare, platformShare, userShare);
    }

    function _send(address to, uint256 amount) internal {
        (bool ok,) = payable(to).call{value: amount}("");
        if (!ok) revert TransferFailed();
    }

    receive() external payable {
        // Recebe valor sem função; use pay() para split fixo.
    }
}

    // ─── EVENTOS ──────────────────────────────────────────────────────────────
    event Subscribed(address indexed user, uint256 expiry);
    event Renewed(address indexed user, uint256 expiry);
    event MonthClosed(uint256 indexed month, uint256 totalPool, uint256 artistPool, uint256 platformPool, uint256 cashbackPool);
    event ArtistRegistered(address indexed artist);
    event ArtistRemoved(address indexed artist);
    event ArtistWithdrew(address indexed artist, uint256 amount);
    event UserCashbackWithdrew(address indexed user, uint256 amount);
    event PlatformWithdrew(uint256 amount);
    event ListeningRecorded(address indexed user, address indexed artist, uint256 minutes);

    // ─── STRUCTS ──────────────────────────────────────────────────────────────
    struct Subscriber {
        uint256 expiry;          // timestamp de expiração
        uint256 cashbackBalance; // cashback acumulado liberado
        uint256 pendingCashback; // cashback pendente (antes do fechamento)
    }

    struct Artist {
        bool registered;
        uint256 balance;         // saldo liberado para saque
        uint256 pendingBalance;  // saldo pendente (antes do fechamento)
        uint256 totalMinutes;    // minutos ouvidos no mês atual
    }

    struct MonthlyReport {
        uint256 totalPool;
        uint256 artistPool;
        uint256 platformPool;
        uint256 cashbackPool;
        uint256 closedAt;
    }

    // ─── ESTADO ───────────────────────────────────────────────────────────────
    address public owner;
    uint256 public subscriptionPrice;   // preço em wei (definido no deploy)
    uint256 public constant DURATION = 30 days;

    // Distribuição (em basis points: 10000 = 100%)
    uint256 public constant ARTIST_BPS   = 6000; // 60%
    uint256 public constant PLATFORM_BPS = 3000; // 30%
    uint256 public constant CASHBACK_BPS = 1000; // 10%

    uint256 public currentMonth;
    uint256 public platformBalance;      // saldo da plataforma liberado
    uint256 public pendingPlatform;      // pendente do mês atual

    mapping(address => Subscriber) public subscribers;
    mapping(address => Artist)     public artists;
    address[] public artistList;

    mapping(uint256 => MonthlyReport) public monthlyReports;

    // Minutos totais ouvidos no mês (para cálculo proporcional)
    uint256 public totalMinutesThisMonth;

    // ─── MODIFICADORES ────────────────────────────────────────────────────────
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlySubscriber() {
        if (subscribers[msg.sender].expiry < block.timestamp) revert NotSubscribed();
        _;
    }

    // ─── CONSTRUTOR ───────────────────────────────────────────────────────────
    /**
     * @param _subscriptionPrice Preço da assinatura em wei
     *        Exemplo: para 20 MON => 20 * 1e18
     */
    constructor(uint256 _subscriptionPrice) {
        if (_subscriptionPrice == 0) revert InsufficientPayment();
        owner = msg.sender;
        subscriptionPrice = _subscriptionPrice;
        currentMonth = 1;
    }

    // ─── ASSINATURA ───────────────────────────────────────────────────────────

    /**
     * @notice Assinar a plataforma pela primeira vez
     */
    function subscribe() external payable {
        if (msg.value < subscriptionPrice) revert InsufficientPayment();

        Subscriber storage sub = subscribers[msg.sender];
        if (sub.expiry >= block.timestamp) revert AlreadySubscribed();

        sub.expiry = block.timestamp + DURATION;

        _distributePayment(msg.sender, msg.value);

        emit Subscribed(msg.sender, sub.expiry);
    }

    /**
     * @notice Renovar assinatura (manual ou chamada pelo backend)
     */
    function renew() external payable {
        if (msg.value < subscriptionPrice) revert InsufficientPayment();

        Subscriber storage sub = subscribers[msg.sender];

        // Se ainda ativa, estende; se expirada, começa do agora
        uint256 base = sub.expiry >= block.timestamp ? sub.expiry : block.timestamp;
        sub.expiry = base + DURATION;

        _distributePayment(msg.sender, msg.value);

        emit Renewed(msg.sender, sub.expiry);
    }

    /**
     * @notice Distribui o pagamento internamente (pendente até fechamento)
     */
    function _distributePayment(address user, uint256 amount) internal {
        uint256 artistShare   = (amount * ARTIST_BPS)   / 10000;
        uint256 platformShare = (amount * PLATFORM_BPS) / 10000;
        uint256 cashbackShare = (amount * CASHBACK_BPS) / 10000;

        pendingPlatform                      += platformShare;
        subscribers[user].pendingCashback    += cashbackShare;

        // artistShare fica no contrato para distribuição no fechamento
        // (proporcional aos minutos ouvidos)
        _ = artistShare; // mantido no balance do contrato
    }

    // ─── ESCUTA (backend registra) ────────────────────────────────────────────

    /**
     * @notice Backend registra minutos ouvidos de um artista por um usuário
     * @dev Apenas owner (backend) pode chamar
     */
    function recordListening(
        address user,
        address artist,
        uint256 minutes_
    ) external onlyOwner {
        if (!artists[artist].registered) revert ArtistNotRegistered();
        if (subscribers[user].expiry < block.timestamp) revert NotSubscribed();

        artists[artist].totalMinutes += minutes_;
        totalMinutesThisMonth        += minutes_;

        emit ListeningRecorded(user, artist, minutes_);
    }

    // ─── FECHAMENTO MENSAL ────────────────────────────────────────────────────

    /**
     * @notice Fecha o mês, consolida pools e distribui para artistas
     * @dev Apenas owner executa (pode ser automatizado via backend)
     */
    function closeMonth() external onlyOwner {
        uint256 contractBalance = address(this).balance;

        // Pool total de artistas = tudo que não é plataforma nem cashback
        uint256 artistPool    = contractBalance - pendingPlatform - _totalPendingCashback();
        uint256 platformPool  = pendingPlatform;
        uint256 cashbackPool  = _totalPendingCashback();

        // Distribui para artistas proporcionalmente aos minutos
        if (totalMinutesThisMonth > 0) {
            for (uint256 i = 0; i < artistList.length; i++) {
                address a = artistList[i];
                Artist storage art = artists[a];
                if (art.totalMinutes > 0) {
                    uint256 share = (artistPool * art.totalMinutes) / totalMinutesThisMonth;
                    art.balance        += share;
                    art.pendingBalance  = 0;
                    art.totalMinutes    = 0;
                }
            }
        }

        // Libera plataforma
        platformBalance  += platformPool;
        pendingPlatform   = 0;
        totalMinutesThisMonth = 0;

        // Salva relatório
        monthlyReports[currentMonth] = MonthlyReport({
            totalPool:    contractBalance,
            artistPool:   artistPool,
            platformPool: platformPool,
            cashbackPool: cashbackPool,
            closedAt:     block.timestamp
        });

        emit MonthClosed(currentMonth, contractBalance, artistPool, platformPool, cashbackPool);

        currentMonth++;
    }

    // ─── SAQUES ───────────────────────────────────────────────────────────────

    /**
     * @notice Artista saca seu saldo liberado
     */
    function withdrawArtist() external {
        Artist storage art = artists[msg.sender];
        if (!art.registered) revert ArtistNotRegistered();
        uint256 amount = art.balance;
        if (amount == 0) revert NothingToWithdraw();

        art.balance = 0;
        _send(msg.sender, amount);

        emit ArtistWithdrew(msg.sender, amount);
    }

    /**
     * @notice Usuário saca seu cashback liberado
     */
    function withdrawCashback() external {
        Subscriber storage sub = subscribers[msg.sender];
        uint256 amount = sub.cashbackBalance;
        if (amount == 0) revert NothingToWithdraw();

        sub.cashbackBalance = 0;
        _send(msg.sender, amount);

        emit UserCashbackWithdrew(msg.sender, amount);
    }

    /**
     * @notice Plataforma saca seu saldo
     */
    function withdrawPlatform() external onlyOwner {
        uint256 amount = platformBalance;
        if (amount == 0) revert NothingToWithdraw();

        platformBalance = 0;
        _send(owner, amount);

        emit PlatformWithdrew(amount);
    }

    // ─── GESTÃO DE ARTISTAS ───────────────────────────────────────────────────

    function registerArtist(address artist) external onlyOwner {
        if (artist == address(0)) revert ZeroAddress();
        if (artists[artist].registered) revert ArtistAlreadyRegistered();

        artists[artist].registered = true;
        artistList.push(artist);

        emit ArtistRegistered(artist);
    }

    function removeArtist(address artist) external onlyOwner {
        if (!artists[artist].registered) revert ArtistNotRegistered();
        artists[artist].registered = false;

        emit ArtistRemoved(artist);
    }

    // ─── ADMIN ────────────────────────────────────────────────────────────────

    function updateSubscriptionPrice(uint256 newPrice) external onlyOwner {
        if (newPrice == 0) revert InsufficientPayment();
        subscriptionPrice = newPrice;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        owner = newOwner;
    }

    // ─── VIEWS ────────────────────────────────────────────────────────────────

    function isSubscribed(address user) external view returns (bool) {
        return subscribers[user].expiry >= block.timestamp;
    }

    function getSubscriberInfo(address user) external view returns (
        uint256 expiry,
        uint256 cashbackBalance,
        uint256 pendingCashback
    ) {
        Subscriber storage sub = subscribers[user];
        return (sub.expiry, sub.cashbackBalance, sub.pendingCashback);
    }

    function getArtistInfo(address artist) external view returns (
        bool registered,
        uint256 balance,
        uint256 totalMinutes
    ) {
        Artist storage art = artists[artist];
        return (art.registered, art.balance, art.totalMinutes);
    }

    function getMonthlyReport(uint256 month) external view returns (MonthlyReport memory) {
        return monthlyReports[month];
    }

    function getArtistCount() external view returns (uint256) {
        return artistList.length;
    }

    // ─── INTERNOS ─────────────────────────────────────────────────────────────

    function _send(address to, uint256 amount) internal {
        (bool ok,) = payable(to).call{value: amount}("");
        if (!ok) revert TransferFailed();
    }

    function _totalPendingCashback() internal view returns (uint256 total) {
        // Simplificado: retorna estimativa baseada em CASHBACK_BPS do total pendente
        // Em produção, manter mapping separado por usuário
        return (address(this).balance * CASHBACK_BPS) / 10000;
    }

    receive() external payable {}
}
