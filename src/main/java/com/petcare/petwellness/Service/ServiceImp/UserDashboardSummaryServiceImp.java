package com.petcare.petwellness.Service.ServiceImp;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.petcare.petwellness.DTO.Response.UserDashboardResponseDTO.AppointmentSummaryResponseDTO;
import com.petcare.petwellness.DTO.Response.UserDashboardResponseDTO.OrderSummaryResponseDTO;
import com.petcare.petwellness.DTO.Response.UserDashboardResponseDTO.ProductSummaryResponseDTO;
import com.petcare.petwellness.DTO.Response.UserDashboardResponseDTO.UserDashboardResponseDTO;
import com.petcare.petwellness.DTO.Response.UserDashboardResponseDTO.VaccineReminderSummaryResponseDTO;
import com.petcare.petwellness.Domain.Entity.Appointment;
import com.petcare.petwellness.Domain.Entity.Order;
import com.petcare.petwellness.Domain.Entity.OrderItem;
import com.petcare.petwellness.Domain.Entity.Product;
import com.petcare.petwellness.Domain.Entity.Vaccination;
import com.petcare.petwellness.Enums.AppointmentStatus;
import com.petcare.petwellness.Enums.OrderStatus;
import com.petcare.petwellness.Enums.ProductStatus;
import com.petcare.petwellness.Enums.VaccinationStatus;
import com.petcare.petwellness.Repository.AppointmentRepository;
import com.petcare.petwellness.Repository.OrderItemRepository;
import com.petcare.petwellness.Repository.OrderRepository;
import com.petcare.petwellness.Repository.ProductRepository;
import com.petcare.petwellness.Repository.PetRepository;
import com.petcare.petwellness.Repository.VaccinationRepository;
import com.petcare.petwellness.Repository.UserRepository;
import com.petcare.petwellness.Domain.Entity.User;
import com.petcare.petwellness.Service.UserDashboardSummaryService;
import com.petcare.petwellness.Util.FileStorageUtil;

@Service
public class UserDashboardSummaryServiceImp implements UserDashboardSummaryService {

    private static final int SUMMARY_LIMIT = 3;
    private static final int PRODUCT_LIMIT = 4;
    private static final Set<VaccinationStatus> REMINDER_STATUSES = Set.of(
            VaccinationStatus.UPCOMING,
            VaccinationStatus.OVERDUE
    );
    private static final Set<ProductStatus> VISIBLE_PRODUCT_STATUSES = Set.of(ProductStatus.ACTIVE);

    private final AppointmentRepository appointmentRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final PetRepository petRepository;
    private final VaccinationRepository vaccinationRepository;
    private final UserRepository userRepository;
    private final FileStorageUtil fileStorageUtil;

    public UserDashboardSummaryServiceImp(
            AppointmentRepository appointmentRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            ProductRepository productRepository,
            PetRepository petRepository,
            VaccinationRepository vaccinationRepository,
            UserRepository userRepository,
            FileStorageUtil fileStorageUtil) {
        this.appointmentRepository = appointmentRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.petRepository = petRepository;
        this.vaccinationRepository = vaccinationRepository;
        this.userRepository = userRepository;
        this.fileStorageUtil = fileStorageUtil;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDashboardResponseDTO getUserDashboardSummary(Long userId) {
        UserDashboardResponseDTO response = new UserDashboardResponseDTO();
        response.setOwnerFullName(loadOwnerFullName(userId));
        response.setPetCount(petRepository.countByUserId(userId));
        response.setActiveOrderCount(
                orderRepository.countByUserIdAndStatusNotIn(
                        userId,
                        List.of(OrderStatus.CANCELLED, OrderStatus.FAILED)
                )
        );
        response.setAppointments(loadAppointments(userId));
        response.setOrders(loadOrders(userId));
        response.setProducts(loadProducts());
        response.setVaccineReminders(loadVaccineReminders(userId));
        return response;
    }

    private List<AppointmentSummaryResponseDTO> loadAppointments(Long userId) {
        PageRequest pageable = PageRequest.of(
                0,
                SUMMARY_LIMIT,
                Sort.by(Sort.Direction.ASC, "appointmentDate")
                        .and(Sort.by(Sort.Direction.ASC, "startTime"))
        );

        return appointmentRepository.findByUserIdAndStatus(userId, AppointmentStatus.BOOKED, pageable)
                .stream()
                .map(this::mapAppointment)
                .collect(Collectors.toList());
    }

    private List<OrderSummaryResponseDTO> loadOrders(Long userId) {
        PageRequest pageable = PageRequest.of(
                0,
                SUMMARY_LIMIT,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        return orderRepository.findByUserId(userId, pageable)
                .stream()
                .map(this::mapOrder)
                .collect(Collectors.toList());
    }

    private List<ProductSummaryResponseDTO> loadProducts() {
        PageRequest pageable = PageRequest.of(
                0,
                PRODUCT_LIMIT,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        return productRepository.findByStatusIn(List.copyOf(VISIBLE_PRODUCT_STATUSES), pageable)
                .stream()
                .map(this::mapProduct)
                .collect(Collectors.toList());
    }

    private List<VaccineReminderSummaryResponseDTO> loadVaccineReminders(Long userId) {
        PageRequest pageable = PageRequest.of(
                0,
                SUMMARY_LIMIT,
                Sort.by(Sort.Direction.ASC, "nextDueDate")
                        .and(Sort.by(Sort.Direction.DESC, "createdAt"))
        );

        return vaccinationRepository.findByPet_User_IdAndStatusIn(userId, List.copyOf(REMINDER_STATUSES), pageable)
                .stream()
                .map(this::mapReminder)
                .collect(Collectors.toList());
    }

    private String loadOwnerFullName(Long userId) {
        return userRepository.findById(userId)
                .map(User::getFullName)
                .filter(name -> name != null && !name.trim().isEmpty())
                .orElse(null);
    }

    private AppointmentSummaryResponseDTO mapAppointment(Appointment appointment) {
        AppointmentSummaryResponseDTO dto = new AppointmentSummaryResponseDTO();
        dto.setPetName(appointment.getPet() != null ? appointment.getPet().getName() : null);
        dto.setAppointmentDate(appointment.getAppointmentDate());
        dto.setStartTime(appointment.getStartTime());
        dto.setEndTime(appointment.getEndTime());
        dto.setVeterinarianName(appointment.getVeterinarianName());
        dto.setAppointmentType(appointment.getAppointmentType());
        return dto;
    }

    private OrderSummaryResponseDTO mapOrder(Order order) {
        OrderSummaryResponseDTO dto = new OrderSummaryResponseDTO();
        dto.setOrderId(order.getId());
        dto.setSummary(buildOrderSummary(order));
        dto.setImage(resolveOrderImage(order));
        dto.setCreatedAt(order.getCreatedAt());
        dto.setTotalAmount(order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO);
        dto.setStatus(order.getStatus());
        return dto;
    }

    private ProductSummaryResponseDTO mapProduct(Product product) {
        ProductSummaryResponseDTO dto = new ProductSummaryResponseDTO();
        dto.setProductId(product.getId());
        dto.setProductName(product.getProductName());
        dto.setImage(fileStorageUtil.toWebPath(product.getImage()));
        dto.setPrice(product.getPrice());
        dto.setBrand(product.getBrand());
        return dto;
    }

    private VaccineReminderSummaryResponseDTO mapReminder(Vaccination vaccination) {
        VaccineReminderSummaryResponseDTO dto = new VaccineReminderSummaryResponseDTO();
        dto.setPetName(vaccination.getPet() != null ? vaccination.getPet().getName() : null);
        dto.setVaccineName(vaccination.getVaccineName());
        dto.setNextDueDate(vaccination.getNextDueDate());
        dto.setStatus(vaccination.getStatus());
        return dto;
    }

    private String buildOrderSummary(Order order) {
        if (order == null || order.getId() == null) {
            return null;
        }

        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        if (items == null || items.isEmpty()) {
            return "Order #" + order.getId();
        }

        List<String> names = items.stream()
                .map(OrderItem::getProductName)
                .map(this::trimToNull)
                .filter(name -> name != null)
                .distinct()
                .collect(Collectors.toList());

        if (names.isEmpty()) {
            return "Order #" + order.getId();
        }
        if (names.size() == 1) {
            OrderItem first = items.get(0);
            Integer quantity = first != null ? first.getQuantity() : null;
            if (quantity != null && quantity > 1) {
                return names.get(0) + " x " + quantity;
            }
            return names.get(0);
        }

        return names.get(0) + " and " + (names.size() - 1) + " more item(s)";
    }

    private String resolveOrderImage(Order order) {
        if (order == null || order.getId() == null) {
            return null;
        }

        List<OrderItem> items = orderItemRepository.findByOrderId(order.getId());
        if (items == null || items.isEmpty()) {
            return null;
        }

        OrderItem first = items.get(0);
        if (first == null || first.getProduct() == null || first.getProduct().getImage() == null) {
            return null;
        }

        return fileStorageUtil.toWebPath(first.getProduct().getImage());
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
