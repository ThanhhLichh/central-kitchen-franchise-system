<h1 align="center"> Hệ thống Quản lý Bếp Trung Tâm & Cửa hàng Franchise</h1>

![Banner](https://i.ibb.co/p6PzQDXS/Bep-Trung-Tam.jpg)


## Giới thiệu (Introduction)

Hệ thống **Central Kitchen and Franchise Store Management System** là một giải pháp quản lý chuỗi cung ứng thực phẩm toàn diện, được thiết kế chuyên biệt cho mô hình Bếp trung tâm (Central Kitchen) và các cửa hàng nhượng quyền (Franchise Stores).

### Mục tiêu hệ thống
*   **Tối ưu hóa quy trình:** Tự động hóa việc đặt hàng, sản xuất và vận chuyển giữa cửa hàng và bếp trung tâm.
*   **Quản lý tồn kho thời gian thực:** Đảm bảo nguyên liệu luôn sẵn sàng tại cả bếp và cửa hàng, giảm thiểu lãng phí.
*   **Nâng cao tính minh bạch:** Theo dõi chính xác trạng thái đơn hàng từ khâu chuẩn bị đến khi giao tới tay chi nhánh.

### Vấn đề giải quyết
Hệ thống giải quyết các bài toán khó khăn trong vận hành chuỗi như: sai sót trong đơn hàng thủ công, thiếu hụt nguyên liệu đột xuất, khó khăn trong việc điều phối sản xuất và thiếu dữ liệu thống kê chính xác giữa các thực thể trong chuỗi.

---

##  Tổng quan hệ thống (System Overview)

Hệ thống hoạt động dựa trên cơ chế cộng tác giữa các đơn vị:
1.  **Cửa hàng Franchise:** Đóng vai trò là nơi tiêu thụ, tạo nhu cầu hàng hóa.
2.  **Bếp Trung Tâm:** Đóng vai trò là trung tâm sản xuất và kho tổng, điều phối nguồn lực để đáp ứng nhu cầu từ các chi nhánh.

Sự tương tác giữa các bên được trung chuyển qua các Microservices độc lập, đảm bảo hệ thống luôn hoạt động ổn định và dễ dàng mở rộng quy mô.

---

##  Kiến trúc hệ thống (Architecture)

Hệ thống được xây dựng theo kiến trúc **Microservices**, cho phép mỗi dịch vụ thực hiện một chức năng chuyên biệt và có khả năng scale độc lập.

| Dịch vụ | Chức năng chính |
| :--- | :--- |
| **Auth Service** | Quản lý xác thực, phân quyền . |
| **Order Service** |  Tiếp nhận và quản lý vòng đời đơn hàng từ các cửa hàng Franchise. |
| **Inventory Service** |  Theo dõi số lượng tồn kho nguyên liệu và thành phẩm tại bếp và cửa hàng. |
| **Production Service** |  Lập kế hoạch sản xuất và điều phối quy trình chế biến tại bếp trung tâm. |
| **Delivery Service** |  Quản trạng thái giao hàng từ bếp đến cửa hàng. |

---

## Luồng hoạt động (Workflow)

Quy trình vận hành chuẩn của hệ thống:

1.  **Order Creation:** Nhân viên tại Store tạo đơn yêu cầu hàng hóa qua *Order Service*.
2.  **Processing:** *Order Service* tiếp nhận và gửi tín hiệu kiểm tra.
3.  **Inventory Check:** *Inventory Service* kiểm tra số lượng hàng trong kho.
    *   Nếu đủ: Chuyển sang khâu đóng gói.
    *   Nếu thiếu: Gửi yêu cầu sang *Production Service*.
4.  **Production:** Bếp trung tâm thực hiện chế biến hàng hóa dựa trên lệnh sản xuất.
5.  **Delivery:** Sau khi hàng sẵn sàng, *Delivery Service* điều phối nhân viên giao hàng vận chuyển đến Store.
6.  **Confirmation:** Store kiểm tra hàng và xác nhận nhận hàng trên hệ thống để hoàn tất quy trình.

---

## Tác nhân hệ thống (Actors)

*   **Franchise Store Staff:** Đặt hàng, xác nhận nhận hàng.
*   **Central Kitchen Staff:** Tiếp nhận lệnh sản xuất, cập nhật trạng thái chế biến.
*   **Supply Coordinator:** Điều phối đơn hàng, quản lý lượng tồn kho tổng.
*   **Manager:** Theo dõi báo cáo tổng quan, hiệu suất làm việc.
*   **Admin:** Quản trị hệ thống, quản lý tài khoản .

---


##  Công nghệ sử dụng (Tech Stack)

![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![C#](https://img.shields.io/badge/c%23-%23239120.svg?style=for-the-badge&logo=c-sharp&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)
![Firebase](https://img.shields.io/badge/firebase-ffca28?style=for-the-badge&logo=firebase&logoColor=black)


*   **Backend:** Python , C# 
*   **Infrastructure:** Docker
*   **Message Broker:** RabbitMQ
*   **Database:** PostgreSQL / MongoDB /  MySQL
*   **Firebassse notification**

---


## 📁 Cấu trúc thư mục (Project Structure)

```text
central-kitchen-system/
├── AuthService/            # Xác thực và phân quyền     
├── order-service/          # Quản lý đơn hàng
├── inventory-service/      # Quản lý kho hàng
├── production-service/     # Quản lý sản xuất tại bếp
├── delivery-service/       # Quản lý giao hàng
├── api-gateway/
├── frontend/     
├── docker-compose.yml     
└── README.md
```

---

##  Cách chạy hệ thống (Getting Started)
```text
1. Yêu cầu môi trường (Prerequisites)

Đảm bảo máy đã cài đặt:

Docker & Docker Compose
Git
(Optional) .NET SDK, Python nếu muốn chạy service riêng lẻ

2. Clone project

git clone https://github.com/your-repo/central-kitchen-system.git
cd central-kitchen-system

3. Chạy hệ thống bằng Docker

docker-compose up --build

```

##  Thành viên nhóm (Team Members)

Hệ thống được phát triển bởi:
*   **Lịch**
*   **Ceasar**
*   **Luân**
*   **Phát**
*   **Hiếu**


---

## 🤝 Đóng góp (Contribution)

Dự án được phân chia theo mô hình Microservices, trong đó mỗi thành viên phụ trách phát triển và duy trì một dịch vụ cụ thể.
*   Chi tiết công việc và tiến độ được cập nhật tại:
 [Tài liệu Confluence](https://cnpm-nhom8.atlassian.net/wiki/spaces/XDPMHDT202/overview?homepageId=328238)
 [Tài liệu Jira](https://cnpm-nhom8.atlassian.net/jira/software/projects/KAN/boards/1)


---

