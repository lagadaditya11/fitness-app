package com.fitness.tracker.weight;

import com.fitness.tracker.config.CurrentUser;
import com.fitness.tracker.user.User;
import com.fitness.tracker.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WeightServiceTest {

    @Mock
    private WeightLogRepository weightLogRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CurrentUser currentUser;

    @InjectMocks
    private WeightService weightService;

    private User user() {
        User u = new User();
        u.setId(1L);
        u.setEmail("user@example.com");
        u.setPassword("x");
        u.setDisplayName("Test");
        return u;
    }

    @Test
    void rejectsInvalidWeight() {
        assertThatThrownBy(() -> weightService.upsert(LocalDate.now(), 0))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> weightService.upsert(LocalDate.now(), -5))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> weightService.upsert(LocalDate.now(), 501))
                .isInstanceOf(IllegalArgumentException.class);
        verify(weightLogRepository, never()).save(any());
    }

    @Test
    void createsNewLogWhenNoneExistsForDate() {
        User u = user();
        when(currentUser.get()).thenReturn(u);
        when(weightLogRepository.findByUserAndDate(u, LocalDate.of(2026, 8, 21))).thenReturn(Optional.empty());
        when(weightLogRepository.findFirstByUserOrderByDateDesc(u))
                .thenReturn(Optional.of(newLog(u, LocalDate.of(2026, 8, 21), 75.5)));

        WeightService.WeightPoint point = weightService.upsert(LocalDate.of(2026, 8, 21), 75.5);

        assertThat(point.weightKg()).isEqualTo(75.5);
        ArgumentCaptor<WeightLog> captor = ArgumentCaptor.forClass(WeightLog.class);
        verify(weightLogRepository).save(captor.capture());
        assertThat(captor.getValue().getWeightKg()).isEqualTo(75.5);
        // Profile weight synced with latest entry
        verify(userRepository).save(u);
        assertThat(u.getWeightKg()).isEqualTo(75.5);
    }

    @Test
    void updatesExistingLogForSameDate() {
        User u = user();
        WeightLog existing = newLog(u, LocalDate.of(2026, 8, 20), 76.0);
        when(currentUser.get()).thenReturn(u);
        when(weightLogRepository.findByUserAndDate(u, LocalDate.of(2026, 8, 20))).thenReturn(Optional.of(existing));
        when(weightLogRepository.findFirstByUserOrderByDateDesc(u)).thenReturn(Optional.of(existing));

        weightService.upsert(LocalDate.of(2026, 8, 20), 74.0);

        assertThat(existing.getWeightKg()).isEqualTo(74.0);
        verify(weightLogRepository).save(existing);
    }

    @Test
    void doesNotSyncProfileWeightFromOlderEntry() {
        User u = user();
        when(currentUser.get()).thenReturn(u);
        when(weightLogRepository.findByUserAndDate(any(), any())).thenReturn(Optional.empty());
        // Latest log is NEWER than the date being edited
        when(weightLogRepository.findFirstByUserOrderByDateDesc(u))
                .thenReturn(Optional.of(newLog(u, LocalDate.of(2026, 8, 22), 73.0)));

        weightService.upsert(LocalDate.of(2026, 8, 21), 75.0);

        verify(userRepository, never()).save(any());
        assertThat(u.getWeightKg()).isNull();
    }

    private WeightLog newLog(User u, LocalDate date, double kg) {
        WeightLog w = new WeightLog();
        w.setUser(u);
        w.setDate(date);
        w.setWeightKg(kg);
        return w;
    }
}
