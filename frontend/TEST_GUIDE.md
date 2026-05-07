# Test Suite Documentation

## Frontend Tests

### Overview
Automated tests have been created for critical frontend components to ensure code quality and prevent regressions.

### Test Files Created

1. **HeaderRight.test.tsx**
   - Tests avatar source consistency using user email
   - Validates user profile information display
   - Tests navigation links functionality
   - Checks logout button presence

2. **MyAssetsRow.test.tsx**
   - Tests asset information rendering
   - Validates color coding based on asset status
   - Tests that action buttons (visibility/receipt) don't navigate away
   - Ensures no logout happens on button clicks

3. **HeaderRight.integration.test.tsx**
   - Tests avatar consistency across multiple renders
   - Validates user information persistence

4. **MyAssets.integration.test.tsx**
   - Tests wallet asset rendering
   - Validates balance display
   - Tests action buttons for all assets

### Running Tests

```bash
# Navigate to frontend directory
cd frontend

# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run specific test file
npm test HeaderRight.test.tsx
```

### What These Tests Verify

#### Avatar Synchronization Issue (Fixed)
- ✅ Avatar in profile page uses Dicebear API with user email seed
- ✅ Avatar in header menu uses the same Dicebear API
- ✅ Both avatars update consistently when user email changes
- ✅ No hardcoded image URLs that could cause mismatches

#### Logout Issue on MyAssets Icons (Fixed)
- ✅ Visibility and receipt icons are buttons, not links
- ✅ Clicking icons doesn't navigate to login page
- ✅ User remains authenticated after clicking icons
- ✅ No unintended route changes occur

### Test Coverage

The tests cover:
- Component rendering
- User data display
- Avatar consistency
- Button functionality
- Navigation integrity
- Asset display

### CI/CD Integration

Add to your CI/CD pipeline:
```yaml
- name: Run Frontend Tests
  run: npm test -- --coverage
```

---

## Backend Tests (Go)

Backend test files are provided in the following locations:
- `backend/api-server/controllers/*_test.go`
- `backend/api-server/blockchain/*_test.go`
- `backend/api-server/config/*_test.go`

Run backend tests with:
```bash
cd backend/api-server
go test ./...
```
